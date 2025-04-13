const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function getTranslatedFilePath(originalPath, targetFramework, targetOptions) {
  const parts = originalPath.split('/');
  let filename = parts.pop();
  const baseName = filename.substring(0, filename.lastIndexOf('.'));
  let newExtension = '.js'; // Default

  switch (targetFramework) {
      case 'react':
      case 'nextjs':
          newExtension = targetOptions.typescript ? '.tsx' : '.jsx';
          break;
      case 'vue':
      case 'nuxt':
          newExtension = '.vue'; // Keep .vue for Vue/Nuxt
          break;
      case 'angular':
          newExtension = '.ts'; // Angular typically uses .ts
           // Attempt to keep specific naming conventions if possible
           if (filename.includes('.component.')) newExtension = '.component.ts';
           else if (filename.includes('.service.')) newExtension = '.service.ts';
           else if (filename.includes('.module.')) newExtension = '.module.ts';
          break;
      case 'svelte':
          newExtension = '.svelte'; // Keep .svelte
          break;
      // Add other cases if needed
      default:
          // Try to keep original extension if not a major framework,
          // or default to .js/.ts based on target options
           const originalExt = originalPath.substring(originalPath.lastIndexOf('.'));
           if (['.js', '.ts', '.mjs', '.json'].includes(originalExt)) {
              newExtension = targetOptions.typescript ? '.ts' : '.js';
           } else {
               newExtension = targetOptions.typescript ? '.ts' : '.js'; // Fallback
           }
  }
  // Handle files that might not change extension (e.g., CSS, JSON)
  const nonCodeExtensions = ['.css', '.scss', '.less', '.json', '.md', '.html'];
  const originalExt = originalPath.substring(originalPath.lastIndexOf('.')).toLowerCase();
  if (nonCodeExtensions.includes(originalExt)) {
      newExtension = originalExt;
  }
  // Reconstruct the path
  parts.push(baseName + newExtension);
  return parts.join('/');
}

import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { buildMasterPrompt, buildFilePrompt, buildArchitecturePrompt } from '../services/transformation/promptBuilder';
// Correct import path assuming llmService V2 is the new file name or replaces the old one
import { configureLlmService, createTranslationPlan, translateFile, getArchitectureRecommendations } from '../services/api/llmService';
import { exportFilesAsZip, exportFile } from '../services/export/fileExport';
import { cleanContent } from '../services/utils/contentCleaner';

// --- Configuration ---
const INTER_FILE_DELAY_MS = 5000; // Base delay between files (5 seconds)
const INTER_FILE_JITTER_MS = 3000; // Random jitter up to 3 seconds

export const useProcessingStore = defineStore('processing', () => {
    // State
    const isProcessing = ref(false);
    const currentStep = ref('idle'); // idle, architecture, planning, translating, completed, error
    const progress = ref(0);
    const apiKey = ref('');
    const errors = ref([]);
    const translationPlan = ref('');
    const translatedFiles = ref({});
    const currentFile = ref(null);
    const processingQueue = ref([]); // Stores { path: string, content: string, status: 'pending' | 'processing' | 'completed' | 'error', errorMessage?: string }
    const architectureRecommendations = ref('');

    // Getters
    const completedCount = computed(() => processingQueue.value.filter(f => f.status === 'completed').length);
    const errorCount = computed(() => processingQueue.value.filter(f => f.status === 'error').length);
    const totalToProcess = computed(() => processingQueue.value.length);

    const progressPercentage = computed(() => {
        if (totalToProcess.value === 0) return 0;
        // Calculate progress based on completed and errored files
        const processedCount = completedCount.value + errorCount.value;
        // Add partial progress for the currently processing file if applicable
        // (This is simplified, more granular progress could be added)
        let currentProgress = Math.round((processedCount / totalToProcess.value) * 100);

        // Rough progress increments during phases
        if (currentStep.value === 'architecture' && progress.value < 5) return 5;
        if (currentStep.value === 'planning' && progress.value < 10) return 10;
        if (currentStep.value === 'translating') {
             // Base progress is 10%, add file progress
             const fileProgress = totalToProcess.value > 0 ? Math.round((processedCount / totalToProcess.value) * 85) : 0;
             currentProgress = 10 + fileProgress;
        }
         if (currentStep.value === 'completed') return 100;

        return Math.min(currentProgress, 99); // Cap at 99 until truly complete
    });

    const isComplete = computed(() => currentStep.value === 'completed');
    const hasFailed = computed(() => currentStep.value === 'error' || errorCount.value > 0);

    // Actions
    function setApiKey(key) {
        if (!key) {
            console.warn('Empty API key provided');
            return;
        }
        console.log('Setting API key:', key.substring(0, 5) + '...');
        apiKey.value = key;
        try {
            // Use the correct function name from llmService.js
            configureLlmService({ apiKey: key });
            console.log('LLM service configured successfully');
        } catch (error) {
            console.error('Error configuring LLM service:', error);
            errors.value.push({ phase: 'config', message: 'Failed to configure LLM Service', error });
        }
    }

    function addError(phase, message, file = null, error = null) {
        console.error(`Error during ${phase}:`, message, error);
        errors.value.push({ phase, message, file, error: error ? error.message : 'Unknown error' });
        // Optionally set main process state to error
        // currentStep.value = 'error';
    }

     async function startTranslation(config, repoContent, files, dependencyInfo) {
        if (isProcessing.value) {
            console.warn("Processing already in progress.");
            return;
        }

        // --- Reset State ---
        isProcessing.value = true;
        currentStep.value = 'idle';
        progress.value = 0;
        errors.value = [];
        translationPlan.value = '';
        translatedFiles.value = {}; // Store final content here
        currentFile.value = null;
        architectureRecommendations.value = '';
        processingQueue.value = files.map(file => ({
            path: file.path,
            content: file.content,
            status: 'pending',
            errorMessage: null
        }));

        try {
            if (!apiKey.value) {
                throw new Error('API key not configured. Please enter an API key first.');
            }
             // Ensure service is configured (might be redundant if setApiKey was called, but safe)
             configureLlmService({ apiKey: apiKey.value });

             processingQueue.value.forEach((fileItem, index) => {
              if (fileItem.isEmpty && !fileItem.errorMessage) {
                 const emptyErrorMsg = 'File is empty and cannot be translated.';
                 fileItem.status = 'error';
                 fileItem.errorMessage = emptyErrorMsg;
                 addError('validation', emptyErrorMsg, fileItem.path);
              }
            });
            // --- Step 1: Architecture Recommendations ---
            currentStep.value = 'architecture';
            progress.value = 5; // Update progress state
             console.log("Requesting architecture recommendations...");
            try {
                const architecturePrompt = buildArchitecturePrompt(config);
                architectureRecommendations.value = await getArchitectureRecommendations(architecturePrompt);
                console.log("Architecture recommendations received.");
            } catch (error) {
                 addError('architecture', 'Failed to get architecture recommendations', null, error);
                 architectureRecommendations.value = `// Could not generate: ${error.message}`;
                 // Decide whether to continue or stop if architecture fails (currently continues)
            }

            // --- Step 2: Translation Plan ---
            currentStep.value = 'planning';
            progress.value = 10; // Update progress state
            console.log("Requesting translation plan...");
            try {
                const masterPrompt = buildMasterPrompt(config, repoContent);
                let planBuffer = ''; // Buffer for streaming plan
                 await createTranslationPlan(masterPrompt, (chunk) => {
                     planBuffer += chunk;
                     translationPlan.value = planBuffer; // Update reactive ref as chunks arrive
                 });
                 console.log("Translation plan received.");
            } catch (error) {
                 addError('planning', 'Failed to create translation plan', null, error);
                 translationPlan.value = `// Could not generate plan: ${error.message}`;
                 // Decide whether to continue or stop (currently continues)
            }

            // --- Step 3: File Translation Loop ---
            currentStep.value = 'translating';
            console.log(`Starting translation of ${totalToProcess.value} files...`);

            for (let i = 0; i < processingQueue.value.length; i++) {
                const fileToProcess = processingQueue.value[i];
                if (fileToProcess.status === 'error') {
                    console.log(`Skipping file due to previous error: ${fileToProcess.path}`);
                    progress.value = 10 + Math.round(((i + 1) / totalToProcess.value) * 85);
                    continue; // Skip files with errors
                } 

                currentFile.value = fileToProcess;
                fileToProcess.status = 'processing';

                // --- Add Delay ---
                const delayTime = INTER_FILE_DELAY_MS + Math.random() * INTER_FILE_JITTER_MS;
                 console.log(`Waiting ${(delayTime / 1000).toFixed(1)}s before translating ${fileToProcess.path}`);
                 await delay(delayTime);

                progress.value = 10 + Math.round(((i + 1) / totalToProcess.value) * 85);

                console.log(`Translating file <span class="math-inline">\{i \+ 1\}/</span>{totalToProcess.value}: ${fileToProcess.path}`);

                 const targetPath = getTranslatedFilePath(
                  fileToProcess.path,
                  config.targetFramework,
                  config.targetOptions || {} // Ensure targetOptions is passed
              );
              console.log(`Target path will be: ${targetPath}`);
                if (!shouldTranslateFile(fileToProcess.path)) {
                    console.log(`Skipping excluded file type: ${fileToProcess.path}`);
                    translatedFiles.value[targetPath] = fileToProcess.content; // Keep original content
                    fileToProcess.status = 'completed'; // Mark as completed (skipped)
                    continue;
                }
                
                try {
                     const filePrompt = buildFilePrompt(
                        config,
                        fileToProcess.path,
                        fileToProcess.content,
                        dependencyInfo
                     );

                    let fileContentBuffer = '';
                    await translateFile(filePrompt, (chunk) => {
                        fileContentBuffer += chunk;
                        translatedFiles.value[fileToProcess.path] = fileContentBuffer;
                     });

                     fileContentBuffer = cleanContent(fileContentBuffer); // Clean the content

                     // Store final content when done
                     translatedFiles.value[targetPath] = fileContentBuffer;
                    fileToProcess.status = 'completed';
                     console.log(`Successfully translated ${fileToProcess.path} -> ${targetPath}`);

                } catch (error) {
                    addError('file-translation', `Failed to translate ${fileToProcess.path}`, fileToProcess.path, error);
                    fileToProcess.status = 'error';
                    fileToProcess.errorMessage = error.message;
                    // Store error message in translated content for display
                    translatedFiles.value[fileToProcess.path] = `// TRANSLATION FAILED: ${error.message}\n\n// --- ORIGINAL CONTENT --- \n${fileToProcess.content}`;

                     // Check for critical rate limit error to potentially stop early
                     if (error.message?.includes("RATE_LIMIT_ALL")) {
                          console.error("All models rate limited. Stopping translation process.");
                          currentStep.value = 'error'; // Set final state to error
                          isProcessing.value = false; // Stop processing
                          return; // Exit the function
                     }
                     currentFile.value = null; // Clear current file indicator on error
                }
                 currentFile.value = null; // Clear current file indicator after processing
            }

            // --- Step 4: Completion ---
            console.log("Translation process finished.");
            currentStep.value = 'completed';
            progress.value = 100;

        } catch (error) {
             // Catch errors from initial setup (e.g., API key missing)
             addError('initialization', 'Failed to start translation process', null, error);
             currentStep.value = 'error';
        } finally {
             console.log(`Processing ended. Status: ${currentStep.value}. Errors: ${errorCount.value}`);
            isProcessing.value = false; // Ensure processing flag is reset
        }
    }

    function shouldTranslateFile(path) {
        const excludedExtensions = [
            '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot',
            '.zip', '.gz', '.tar', '.pdf', // Common binary/archive types
             '.lock', // Lock files
             '.DS_Store'
        ];
         // Also exclude common config/metadata files that shouldn't be translated
         const excludedFiles = ['package-lock.json', 'yarn.lock', '.gitignore'];
         const fileName = path.substring(path.lastIndexOf('/') + 1);

         if (excludedFiles.includes(fileName)) return false;

        const extension = path.substring(path.lastIndexOf('.')).toLowerCase();
        return !excludedExtensions.includes(extension);
    }

    async function exportAsZip() {
      try {
          const JSZip = await import('jszip');
          const zip = new JSZip.default();
 
          // Iterate over the keys (which are now target paths) in translatedFiles
          for (const [path, content] of Object.entries(translatedFiles.value)) {
              zip.file(path, content); // Use the key directly as the path in the zip
          }
          // ... (add plan and recommendations) ...
           if (translationPlan.value) {
              zip.file('translation-plan.md', translationPlan.value);
          }
          if (architectureRecommendations.value) {
              zip.file('architecture-recommendations.md', architectureRecommendations.value);
          }
          return await zip.generateAsync({ type: 'blob' });
      } catch (error) {
          addError('export', 'Error creating ZIP file', null, error);
          throw error;
      }
  }

    function downloadFile(path) {
        const content = translatedFiles.value[path];
        if (content === undefined || content === null) {
             addError('download', `Could not find content for file: ${path}`);
             return;
         }
        exportFile(content, path.split('/').pop() || 'downloaded-file');
    }

    async function downloadZip(zipName = 'translated-files.zip') {
        try {
            // Prepare files for export, including additional documents
            const filesToExport = { ...translatedFiles.value };

            if (translationPlan.value) {
                filesToExport['translation-plan.md'] = translationPlan.value;
            }
            if (architectureRecommendations.value) {
                filesToExport['architecture-recommendations.md'] = architectureRecommendations.value;
            }

            await exportFilesAsZip(filesToExport, zipName);
        } catch (error) {
             addError('download', 'Failed to download ZIP', null, error);
             // Consider notifying the user via UI
        }
    }

    function resetProcessing() {
        console.log("Resetting processing state.");
        isProcessing.value = false;
        currentStep.value = 'idle';
        progress.value = 0;
        errors.value = [];
        translationPlan.value = '';
        translatedFiles.value = {};
        currentFile.value = null;
        processingQueue.value = [];
        architectureRecommendations.value = '';
        // Do NOT reset apiKey here, user might want to reuse it
    }

    function getProcessSummary() {
        return {
            totalFiles: totalToProcess.value,
            translatedFiles: completedCount.value,
            errors: errorCount.value,
            status: currentStep.value,
            progress: progressPercentage.value // Use computed progress
        };
    }

    function isFileTranslated(targetPath) {
        const file = processingQueue.value.find(f => f.path === path);
        return file?.status === 'completed';
    }

    function getTranslatedContent(path) {
        return translatedFiles.value[path] ?? null; // Use nullish coalescing
    }

    function getFileErrors(path) {
        return errors.value.filter(error => error.file === path);
    }

     function getFileStatus(path) {
         const file = processingQueue.value.find(f => f.path === path);
         return file ? { status: file.status, message: file.errorMessage } : { status: 'not_found' };
     }

    return {
        // State
        isProcessing,
        currentStep,
        progress, // Raw progress for internal use maybe
        apiKey,
        errors,
        translationPlan,
        translatedFiles,
        currentFile,
        processingQueue, // Expose for detailed status UI
        architectureRecommendations,

        // Getters
        completedCount,
        errorCount,
        totalToProcess,
        progressPercentage, // Use this for UI progress display
        isComplete,
        hasFailed,

        // Actions
        setApiKey,
        startTranslation,
        exportAsZip,
        downloadFile,
        downloadZip,
        resetProcessing,
        getProcessSummary,
        isFileTranslated,
        getTranslatedContent,
        getFileErrors,
        getFileStatus // New helper for UI
    };
});