<template>
  <div class="setup-page">
    <main class="main-content">
      <div class="container">
        <h1 class="page-title">Setup Your Translation</h1>
        
        <div class="setup-container">
          <div class="setup-steps">
            <div 
              v-for="(step, index) in steps" 
              :key="index" 
              class="step"
              :class="{ 
                'active': currentStep === index,
                'completed': index < currentStep 
              }"
              @click="goToStep(index)"
            >
              <div class="step-number">
                <span v-if="index < currentStep">✓</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="step-label">{{ step.label }}</div>
            </div>
          </div>
          
          <div class="setup-content">
            <h2 class="step-title">{{ steps[currentStep].title }}</h2>
            
            <!-- Framework Selection Step -->
            <div v-if="currentStep === 0" class="framework-selection">
              <div class="framework-group">
                <label class="section-label">Source Framework</label>
                <div class="framework-options">
                  <div 
                    v-for="(framework, index) in frameworks" 
                    :key="`source-${index}`"
                    class="framework-option"
                    :class="{ 
                      'selected': sourceFramework === framework.id,
                      'disabled': targetFramework === framework.id
                    }"
                    @click="selectSourceFramework(framework.id)"
                  >
                    <div class="framework-icon">
                      <component :is="framework.logo" />
                    </div>
                    <div class="framework-name">{{ framework.name }}</div>
                  </div>
                </div>
              </div>
              
              <div class="framework-arrows">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              
              <div class="framework-group">
                <label class="section-label">Target Framework</label>
                <div class="framework-options">
                  <div 
                    v-for="(framework, index) in frameworks" 
                    :key="`target-${index}`"
                    class="framework-option"
                    :class="{ 
                      'selected': targetFramework === framework.id,
                      'disabled': sourceFramework === framework.id
                    }"
                    @click="selectTargetFramework(framework.id)"
                  >
                    <div class="framework-icon">
                      <component :is="framework.logo" />
                    </div>
                    <div class="framework-name">{{ framework.name }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- File Upload Step -->
            <div v-else-if="currentStep === 1" class="file-upload-section">
              <div class="upload-container" :class="{ 'drag-active': isDragging }">
                <input 
                  type="file" 
                  multiple 
                  @change="handleFileUpload"
                  class="file-input"
                  id="file-upload"
                />
                
                <input 
                  type="file" 
                  multiple 
                  @change="handleDirectoryUpload"
                  class="file-input"
                  id="directory-upload"
                  webkitdirectory
                  directory
                  ref="directoryUpload"
                />
                
                <label 
                  for="file-upload" 
                  class="file-upload-label"
                  @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave"
                  @drop.prevent="handleFileDrop"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M12 12v9"></path>
                    <path d="m16 16-4-4-4 4"></path>
                  </svg>
                  <p>Drag and drop your files here<br/>or click to select files</p>
                  <button type="button" class="directory-btn" @click.prevent="triggerDirectoryUpload"> Or select a folder
                  </button>
                  <span class="file-types">Supported: .js, .jsx, .ts, .tsx, .vue, .svelte, .html, .css</span>
                </label>
              </div>
              
              <div v-if="filesStore.isAnalyzing" class="analysis-loading">
                <div class="spinner"></div>
                <p>Analyzing files...</p>
              </div>
              
              <div v-else-if="filesStore.uploadedFiles.length > 0" class="file-analysis">
                <div class="analysis-header">
                  <h3>Project Analysis</h3>
                  <button class="clear-btn" @click="clearFiles">Clear Files</button>
                </div>
                
                <div class="file-explorer">
                  <div class="file-tree-container">
                    <FileTree 
                      :tree-data="filesStore.fileTree" 
                      :selected-file="filesStore.selectedFile"
                      @file-select="selectFile"
                    />
                  </div>
                  <div class="file-content-container">
                    <FileViewer :node="filesStore.selectedFile" />
                  </div>
                </div>
                
                <div v-if="filesStore.projectAnalysis" class="analysis-stats">
                  <div class="stat-item">
                    <div class="stat-label">Files</div>
                    <div class="stat-value">{{ filesStore.fileCount }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Components</div>
                    <div class="stat-value">{{ filesStore.projectAnalysis.componentCount || 0 }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Detected Framework</div>
                    <div class="stat-value">
                      {{ (filesStore.projectAnalysis.detectedFrameworks || []).join(', ') || 'Unknown' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Configuration Step -->
            <div v-else-if="currentStep === 2" class="configuration-section">
              <TranslationOptions 
                :source-framework="sourceFramework"
                :target-framework="targetFramework"
                v-model:source-options="projectStore.sourceOptions"
                v-model:target-options="projectStore.targetOptions"
                v-model:translation-strategy="translationStrategy"
              />
            </div>
            
            <!-- Process Step - Fixed the conditional rendering -->
            <div v-else-if="currentStep === 3">
              <div class="translation-options">
                <div class="form-check">
                  <input 
                    type="checkbox" 
                    id="limit-files" 
                    v-model="limitFileCount"
                    class="form-check-input" 
                  />
                  <label for="limit-files" class="form-check-label">
                    Limit file translation (recommended for free API accounts)
                  </label>
                </div>
                
                <div v-if="limitFileCount" class="file-limit-options">
                  <label for="file-limit" class="limit-label">Maximum files to translate:</label>
                  <input 
                    type="number" 
                    id="file-limit" 
                    v-model="maxFileCount" 
                    min="1" 
                    max="50"
                    class="file-limit-input" 
                  />
                  <p class="limit-help">
                    Translating fewer files helps avoid rate limits. Suggested: 3-5 files.
                  </p>
                </div>
              </div>
              
              <div class="process-section">
                <div class="card summary-card">
                  <h4 class="card-header">Translation Summary</h4>
                  <div class="summary-grid">
                    <div class="summary-item">
                      <div class="summary-label">Source</div>
                      <div class="summary-value">{{ projectStore.selectedSourceFramework?.name || 'N/A' }}</div>
                    </div>
                    <div class="summary-item">
                      <div class="summary-label">Target</div>
                      <div class="summary-value">{{ projectStore.selectedTargetFramework?.name || 'N/A' }}</div>
                    </div>
                    <div class="summary-item">
                      <div class="summary-label">Files</div>
                      <div class="summary-value">{{ filesStore.fileCount }}</div>
                    </div>
                    <div class="summary-item">
                      <div class="summary-label">Components</div>
                      <div class="summary-value">{{ filesStore.projectAnalysis?.componentCount || 0 }}</div>
                    </div>
                    <div class="summary-item full-span">
                      <div class="summary-label">Estimated Processing Time</div>
                      <div class="summary-value estimate">{{ estimatedProcessingTime }}</div>
                    </div>
                  </div>
                </div>

                <div class="card api-card">
                  <h4 class="card-header">API Configuration</h4>
                  <div class="api-input">
                    <label for="api-key">OpenRouter API Key</label>
                    <div class="input-wrapper">
                      <input
                        :type="showApiKey ? 'text' : 'password'"
                        id="api-key"
                        v-model="apiKey"
                        placeholder="Enter your OpenRouter API Key"
                        class="api-key-input"
                      />
                      <button @click="showApiKey = !showApiKey" class="toggle-visibility-btn">
                        <svg v-if="showApiKey" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      </button>
                    </div>
                    <p class="api-note">
                      Your API key is used locally and never stored on our servers.
                    </p>
                  </div>
                </div>
                
                <div v-if="processingStore.isComplete || processingStore.errors.length > 0" class="results-section">
                  <TranslationResults @retry="retryTranslation" />
                </div>
                  <!-- Loading indicator -->
                <div v-else-if="processingStore.isProcessing" class="loading-section">
                  <div class="spinner"></div>
                  <p>Processing translation... {{ processingStore.progress }}%</p>
                  <p class="current-file" v-if="processingStore.currentFile">
                    Currently translating: {{ processingStore.currentFile.path }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Navigation buttons - always visible -->
            <div class="step-navigation">
              <button 
                class="secondary-button" 
                @click="previousStep"
                :disabled="currentStep === 0 || processingStore.isProcessing"
              >
                Previous
              </button>
              <button 
                class="primary-button" 
                @click="nextStep"
                :disabled="!isStepComplete || processingStore.isProcessing"
              >
                {{ currentStep === steps.length - 1 ? 'Start Translation' : 'Continue' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../../stores/project'
import { useFilesStore } from '../../stores/files'
import { 
  FrameworkIconReact, 
  FrameworkIconVue, 
  FrameworkIconAngular, 
  FrameworkIconSvelte, 
  FrameworkIconNextJs, 
  FrameworkIconNuxt 
} from '../../components/icons'
import { useProcessingStore } from '../../stores/processing'
import FileTree from '../common/FileTree.vue'
import FileViewer from '../common/FileViewer.vue'
import TranslationOptions from '../common/TranslationOptions.vue'
import TranslationResults from '../common/TranslationResults.vue';

const router = useRouter()
const projectStore = useProjectStore()
const filesStore = useFilesStore()
const processingStore = useProcessingStore()
const apiKey = ref('')
const showApiKey = ref(false)

const steps = [
  { 
    label: 'Select Frameworks', 
    title: 'Choose Your Translation Path' 
  },
  { 
    label: 'Upload Code', 
    title: 'Upload Your Project Files' 
  },
  { 
    label: 'Configure Options', 
    title: 'Customize Translation Settings' 
  },
  { 
    label: 'Process', 
    title: 'Initiate Translation' 
  }
]

const currentStep = ref(0)
const isDragging = ref(false)
const directoryUpload = ref(null)

// Method to trigger the directory input click
const triggerDirectoryUpload = () => {
  if (directoryUpload.value) {
    directoryUpload.value.click()
  } else {
    console.error("Directory input element not found")
  }
}

const frameworks = [
  {
    id: 'react',
    name: 'React',
    logo: FrameworkIconReact
  },
  {
    id: 'vue',
    name: 'Vue',
    logo: FrameworkIconVue
  },
  {
    id: 'angular',
    name: 'Angular',
    logo: FrameworkIconAngular
  },
  {
    id: 'svelte',
    name: 'Svelte',
    logo: FrameworkIconSvelte
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    logo: FrameworkIconNextJs
  },
  {
    id: 'nuxt',
    name: 'Nuxt',
    logo: FrameworkIconNuxt
  }
]

// Computed properties for easier access
const sourceFramework = computed(() => projectStore.sourceFramework)
const targetFramework = computed(() => projectStore.targetFramework)

const translationStrategy = ref({
  codeStyle: 'idiomatic',
  preserveComments: true,
  generateTests: false,
  specialInstructions: ''
})

// Estimate processing time based on file count and complexity
const estimatedProcessingTime = computed(() => {
  if (!filesStore.projectAnalysis) return '~2 minutes'
  
  const fileCount = filesStore.fileCount
  const componentCount = filesStore.projectAnalysis.componentCount || 0
  
  // Simple estimation algorithm
  const baseTime = 60 // 1 minute base time
  const timePerFile = 5 // 5 seconds per file
  const timePerComponent = 15 // 15 seconds per component
  
  const totalSeconds = baseTime + (fileCount * timePerFile) + (componentCount * timePerComponent)
  
  if (totalSeconds < 60) {
    return `~${totalSeconds} seconds`
  } else if (totalSeconds < 3600) {
    const minutes = Math.ceil(totalSeconds / 60)
    return `~${minutes} minute${minutes > 1 ? 's' : ''}`
  } else {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.ceil((totalSeconds % 3600) / 60)
    return `~${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`
  }
})

// Check if current step is complete
const isStepComplete = computed(() => {
  try {
    switch (currentStep.value) {
      case 0: // Framework selection
        return sourceFramework.value && targetFramework.value
      case 1: // File upload
        // Add more defensive checks
        return filesStore.hasFiles && 
               filesStore.fileTree && 
               !filesStore.isAnalyzing
      case 2: // Configuration
        return true // Always allow moving from configuration step
      case 3: // Process
        return true
      default:
        return false
    }
  } catch (error) {
    console.error('Error in isStepComplete computed property:', error)
    return false // Safe default
  }
})

function resetAndRetry() {
  processingStore.resetProcessing();
  // Reset to an earlier step if needed
  currentStep.value = 2; // Go back to the configuration step
}



// Framework selection methods
const selectSourceFramework = (id) => {
  if (id !== targetFramework.value) {
    projectStore.setSourceFramework(id)
  }
}

const selectTargetFramework = (id) => {
  if (id !== sourceFramework.value) {
    projectStore.setTargetFramework(id)
  }
}

// File handling methods
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    filesStore.addFiles(files)
  }
}

const handleDirectoryUpload = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    filesStore.addFiles(files)
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragging.value = false
}

const handleFileDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) {
    console.log('Dropped files:', files)
    filesStore.addFiles(files)
  }
}

const clearFiles = () => {
  filesStore.clearFiles()
}

const selectFile = (file) => {
  filesStore.selectFile(file.path)
}

// Navigation methods
const goToStep = (stepIndex) => {
  // Only allow going to completed steps or the current step
  if (stepIndex < currentStep.value || (isStepComplete.value && stepIndex <= currentStep.value + 1)) {
    currentStep.value = stepIndex
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const nextStep = () => {
  try {
    if (currentStep.value < steps.length - 1 && isStepComplete.value) {
      // Check if file analysis is in progress before proceeding
      if (currentStep.value === 1 && filesStore.isAnalyzing) {
        console.log('File analysis in progress, please wait...');
        return; // Prevent proceeding while files are being analyzed
      }
      
      currentStep.value++;
      console.log(`Moving to step ${currentStep.value}: ${steps[currentStep.value].label}`);
    } else if (currentStep.value === steps.length - 1) {
      console.log('Final step, starting translation');
      
      // Make sure to set the API key before starting translation
      if (apiKey.value) {
        processingStore.setApiKey(apiKey.value);
        console.log('API key set successfully');
        startTranslation();
      } else {
        alert('Please enter your OpenRouter API key');
      }
    }
  } catch (error) {
    console.error('Error in nextStep function:', error);
  }
}

const limitFileCount = ref(true);
const maxFileCount = ref(3);

// Start translation process
async function startTranslation() {
  try {
    // Basic validation
    if (!apiKey.value) {
      alert('Please enter your OpenRouter API key');
      return;
    }
    
    console.log('Starting translation process');
    
    // Make sure API key is set in the processing store
    processingStore.setApiKey(apiKey.value);
    
    // Set up translation configuration
    const translationConfig = {
      sourceFramework: sourceFramework.value,
      targetFramework: targetFramework.value,
      sourceOptions: projectStore.sourceOptions,
      targetOptions: projectStore.targetOptions,
      translationStrategy: translationStrategy.value,
    };
    
    // Filter files if limiting is enabled
    let filesToTranslate = [...filesStore.flattenedFiles];
    
    if (limitFileCount.value && maxFileCount.value > 0) {
      // First prioritize key files like components
      filesToTranslate.sort((a, b) => {
        // Prioritize main component files
        const aIsComponent = a.path.includes('component') || a.extension === 'vue' || a.extension === 'jsx';
        const bIsComponent = b.path.includes('component') || b.extension === 'vue' || b.extension === 'jsx';
        
        if (aIsComponent && !bIsComponent) return -1;
        if (!aIsComponent && bIsComponent) return 1;
        
        // Then sort by file size (smaller files first)
        return (a.size || 0) - (b.size || 0);
      });
      
      // Limit to specified count
      filesToTranslate = filesToTranslate.slice(0, maxFileCount.value);
      
      console.log(`Limited translation to ${filesToTranslate.length} files`);
    }
    
    // Start the translation process
    await processingStore.startTranslation(
      translationConfig,
      filesStore.repoRepresentation,
      filesToTranslate,
      filesStore.dependencyInfo
    );
    
    console.log('Translation completed');
    
  } catch (error) {
    console.error('Error starting translation:', error);
    alert(`Translation failed: ${error.message}`);
  }
}

function retryTranslation() {
  processingStore.resetProcessing();
  // Reset to the configuration step
  currentStep.value = 2;
}

// Lifecycle hooks
onMounted(() => {
  // Try to detect source framework from uploaded files
  if (filesStore.projectAnalysis && 
      filesStore.projectAnalysis.detectedFrameworks && 
      filesStore.projectAnalysis.detectedFrameworks.length > 0) {
    // Auto-select the first detected framework if none is selected
    const detected = filesStore.projectAnalysis.detectedFrameworks[0]
    if (!sourceFramework.value) {
      projectStore.setSourceFramework(detected)
    }
  }
})
</script>

<style scoped>
.setup-page {
  min-height: 100vh;
  background-color: #f7f9fc;
  font-family: 'Inter', sans-serif;
}

.main-content {
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2rem;
  text-align: center;
}

.setup-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.setup-steps {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  background-color: #f8fafc;
}

.step {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  position: relative;
  opacity: 0.6;
  margin-right: 2rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.step:hover {
  opacity: 0.8;
}

.step::after {
  content: '';
  position: absolute;
  right: -1.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1px;
  background-color: #cbd5e1;
}

.step:last-child {
  margin-right: 0;
}

.step:last-child::after {
  display: none;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 0.8;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #64748b;
  font-weight: 600;
  margin-right: 0.75rem;
  transition: all 0.2s ease;
}

.step.active .step-number {
  background-color: #4776E6;
  color: white;
}

.step.completed .step-number {
  background-color: #10b981;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.step.active .step-label {
  color: #1e293b;
  font-weight: 600;
}

.setup-content {
  padding: 2rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

/* Framework selection styling */
.framework-selection {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.framework-group {
  flex: 1;
}

.section-label {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 1rem;
  display: block;
}

.framework-arrows {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
  color: #94a3b8;
}

.framework-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.framework-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.framework-option:hover:not(.disabled) {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.framework-option.selected {
  border-color: #4776E6;
  box-shadow: 0 2px 4px rgba(71, 118, 230, 0.2);
}

.framework-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.framework-icon {
  margin-bottom: 1rem;
}

.framework-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
}

/* File upload styling */
.file-upload-section {
  margin-bottom: 2rem;
}

.upload-container {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.upload-container:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

.upload-container.drag-active {
  background-color: #f1f5f9;
  border-color: #4776E6;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #64748b;
}

.file-upload-label svg {
  margin-bottom: 1rem;
  color: #4776E6;
}

.file-types {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #4776E6;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(71, 118, 230, 0.2);
  border-top: 3px solid #4776E6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.file-analysis {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;

}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.analysis-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1e293b;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: #dc2626;
}

.file-explorer {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  height: 400px;
  margin-bottom: 1.5rem;
}

.file-tree-container, .file-content-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow: hidden;
}

.analysis-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.stat-item {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  min-width: 120px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.directory-btn {
  background-color: #e2e8f0;
  color: #1e293b;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
}
.directory-btn:hover {
  background-color: #cbd5e1;
}
/* Configuration section */
.configuration-section {
  margin-bottom: 2rem;
}

/* Step navigation */
.step-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.secondary-button, .primary-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-button {
  background-color: transparent;
  border: 2px solid #e2e8f0;
  color: #64748b;
}

.secondary-button:hover:not(:disabled) {
  background-color: #f8fafc;
  color: #475569;
}

.primary-button {
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  border: none;
  color: white;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(71, 118, 230, 0.3);
}

.secondary-button:disabled, .primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .setup-steps {
    overflow-x: auto;
    padding: 1rem;
  }
  
  .step {
    margin-right: 1.5rem;
  }
  
  .framework-selection {
    flex-direction: column;
    gap: 2rem;
  }
  
  .framework-arrows {
    transform: rotate(90deg);
    padding: 1rem 0;
  }
  
  .framework-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .file-explorer {
    grid-template-columns: 1fr;
    grid-template-rows: 200px 1fr;
  }
  
  .config-container {
    grid-template-columns: 1fr;
  }
}

.card {
  background-color: #f8fafc; /* Lighter background for cards */
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 0.75rem 1.25rem;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f1f5f9; /* Slightly different header bg */
  border-radius: 8px 8px 0 0;
}

.summary-card .summary-grid { /* Use grid for better alignment */
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Creates two columns */
  gap: 1rem; /* Adjust gap as needed */
  padding: 1.25rem;
}

.summary-item {
  /* Items will now flow into the grid */
}

.summary-item.full-span {
  grid-column: span 2; /* Make this item span both columns */
  border-top: 1px solid #e2e8f0; /* Add a separator */
  padding-top: 1rem;
  margin-top: 0.5rem;
}


.summary-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1e293b;
}
.summary-value.estimate {
  font-style: italic;
  color: #4776E6;
}


.api-card {
  margin-top: 2rem;
}

.api-card .api-input {
   padding: 1.25rem;
}

.api-input label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
  display: block;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.api-key-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem; /* Add padding for the button */
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  color: #1e293b;
}

.toggle-visibility-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toggle-visibility-btn:hover {
    color: #1e293b;
}


.api-note {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.75rem;
}

.action-container {
  display: flex;
  justify-content: flex-end; /* Align button to the right */
  margin-top: 1.5rem;
}

.start-button {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(71, 118, 230, 0.3);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-btn { /* Basic spinner for button */
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5em;
    vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.translation-options {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.form-check-input {
  width: 1rem;
  height: 1rem;
}

.form-check-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
}

.file-limit-options {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.limit-label {
  font-size: 0.85rem;
  color: #475569;
}

.file-limit-input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.85rem;
}

.limit-help {
  width: 100%;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

/* Update the spinner style for better visibility */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(71, 118, 230, 0.2);
  border-top: 3px solid #4776E6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-section {
  text-align: center;
  padding: 2rem;
  color: #4776E6;
}

.current-file {
  font-size: 0.9rem;
  color: #334155;
  margin-top: 1rem;
}

.results-section {
  margin-top: 2rem;
}

.results-header {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
}

</style>