import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { parseFilesToTree, analyzeProject, flattenFileTree } from '../services/parser/fileParser';
import { analyzeDependencies, createRepoRepresentation } from '../services/parser/repoAnalyzer';

export const useFilesStore = defineStore('files', () => {
  // State
  const uploadedFiles = ref([]);
  const fileTree = ref(null);
  const selectedFile = ref(null);
  const projectAnalysis = ref(null);
  const dependencyInfo = ref(null);
  const repoRepresentation = ref('');
  const isAnalyzing = ref(false);
  const processingErrors = ref([]);

  // Getters
  const fileCount = computed(() => uploadedFiles.value.length);
  const flattenedFiles = computed(() => 
    fileTree.value ? flattenFileTree(fileTree.value) : []
  );
  const hasFiles = computed(() => uploadedFiles.value.length > 0);
  const isReady = computed(() => fileTree.value !== null && projectAnalysis.value !== null);

  // File types counts for statistics
  const fileTypeStats = computed(() => {
    if (!projectAnalysis.value) return {};
    return projectAnalysis.value.fileTypes || {};
  });

  // Actions
  /**
   * Add files to the store
   * @param {File[]} files - Array of File objects
   */
  async function addFiles(files) {
    try {
      console.log('Adding files to store:', files);
      
      // Filter out folders/directories if needed
      const validFiles = files.filter(file => file.size > 0);
      console.log('Valid files:', validFiles);
      
      // Add files to uploadedFiles array
      uploadedFiles.value = [...uploadedFiles.value, ...validFiles];
      console.log('Updated uploadedFiles:', uploadedFiles.value);
      
      // Reset analysis state
      resetAnalysisState();
      
      // Automatically analyze if we have files
      if (uploadedFiles.value.length > 0) {
        await analyzeFiles();
      }
    } catch (error) {
      console.error('Error adding files:', error);
    }
  }

  /**
   * Remove a file from the store
   * @param {number} index - Index of the file to remove
   */
  function removeFile(index) {
    uploadedFiles.value.splice(index, 1);
    
    // Reset analysis state
    resetAnalysisState();
    
    // Re-analyze if we still have files
    if (uploadedFiles.value.length > 0) {
      analyzeFiles();
    }
  }

  /**
   * Clear all files
   */
  function clearFiles() {
    uploadedFiles.value = [];
    resetAnalysisState();
  }

  /**
   * Reset analysis state
   */
  function resetAnalysisState() {
    fileTree.value = null;
    selectedFile.value = null;
    projectAnalysis.value = null;
    dependencyInfo.value = null;
    repoRepresentation.value = '';
    processingErrors.value = [];
  }

  async function analyzeFiles() {
    try {
      isAnalyzing.value = true;
      processingErrors.value = [];
  
      console.log('Starting file analysis...');
  
      // Safely parse files into tree
      try {
        fileTree.value = await parseFilesToTree(uploadedFiles.value);
        console.log('File tree created:', fileTree.value);
      } catch (error) {
        console.error('Error creating file tree:', error);
        processingErrors.value.push({
          phase: 'file-tree',
          message: 'Failed to create file structure',
          error
        });
        // Continue with partial analysis
        if (!fileTree.value) {
          fileTree.value = { name: 'root', type: 'directory', children: [] };
        }
      }
      
      // Safely analyze project structure
      try {
        projectAnalysis.value = analyzeProject(fileTree.value);
        console.log('Project analysis complete:', projectAnalysis.value);
      } catch (error) {
        console.error('Error analyzing project structure:', error);
        processingErrors.value.push({
          phase: 'project-analysis',
          message: 'Failed to analyze project structure',
          error
        });
        // Set default analysis
        if (!projectAnalysis.value) {
          projectAnalysis.value = { 
            detectedFrameworks: [], 
            dependencies: {},
            fileTypes: {},
            componentCount: 0,
            totalFiles: uploadedFiles.value.length
          };
        }
      }
      
      // Safely analyze dependencies - wrap in try/catch
      try {
        const flatFiles = flattenFileTree(fileTree.value);
        dependencyInfo.value = analyzeDependencies(flatFiles);
        console.log('Dependency analysis complete:', dependencyInfo.value);
      } catch (error) {
        console.error('Error analyzing dependencies:', error);
        processingErrors.value.push({
          phase: 'dependency-analysis',
          message: 'Failed to analyze dependencies',
          error
        });
        // Set default dependency info
        if (!dependencyInfo.value) {
          dependencyInfo.value = { dependencyGraph: {}, importMap: {} };
        }
      }
      
      // Safely create repo representation - wrap in try/catch
      try {
        repoRepresentation.value = createRepoRepresentation(
          fileTree.value, 
          projectAnalysis.value
        );
        console.log('Repository representation created');
      } catch (error) {
        console.error('Error creating repo representation:', error);
        processingErrors.value.push({
          phase: 'repo-representation',
          message: 'Failed to create repository representation',
          error
        });
        // Set default repo representation
        if (!repoRepresentation.value) {
          repoRepresentation.value = "Error creating repository representation";
        }
      }
      
      console.log('Analysis complete:', { 
        fileTree: fileTree.value,
        analysis: projectAnalysis.value,
        dependencies: dependencyInfo.value
      });
      
    } catch (error) {
      console.error('Unexpected error during analysis:', error);
      processingErrors.value.push({
        phase: 'analysis',
        message: error.message,
        error
      });
    } finally {
      isAnalyzing.value = false;
    }
  }

  /**
   * Select a file to view
   * @param {string} filePath - Path to the file
   */
  function selectFile(filePath) {
    if (!fileTree.value) return;
    
    // Find the file in the flattened list
    const file = flattenedFiles.value.find(f => f.path === filePath);
    selectedFile.value = file || null;
  }

  return {
    // State
    uploadedFiles,
    fileTree,
    selectedFile,
    projectAnalysis,
    dependencyInfo,
    repoRepresentation,
    isAnalyzing,
    processingErrors,
    
    // Getters
    fileCount,
    flattenedFiles,
    hasFiles,
    isReady,
    fileTypeStats,
    
    // Actions
    addFiles,
    removeFile,
    clearFiles,
    analyzeFiles,
    selectFile
  };
});