<template>
  <div class="translation-results">
    <div class="results-header">
      <h3>Translation Results</h3>
      <div class="action-buttons">
        <button class="action-button" @click="downloadAllAsZip">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download All (ZIP)
        </button>
      </div>
    </div>

    <div v-if="processingStore.isProcessing" class="processing-status">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${processingStore.progress}%` }"></div>
        </div>
        <div class="progress-text">{{ processingStore.progress }}%</div>
      </div>
      <div class="status-message">
        <span v-if="processingStore.currentStep === 'architecture'">Getting architecture recommendations...</span>
        <span v-else-if="processingStore.currentStep === 'planning'">Creating translation plan...</span>
        <span v-else-if="processingStore.currentStep === 'translating'">
          Translating {{ processingStore.currentFile?.path || 'files' }}...
          ({{ processingStore.completedCount }}/{{ processingStore.processingQueue.length }})
        </span>
        <span v-else>Processing...</span>
      </div>
    </div>

    <div v-else-if="processingStore.isComplete" class="results-container">
      <div class="tabs">
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'files' }"
          @click="activeTab = 'files'"
        >
          Files
        </div>
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'plan' }"
          @click="activeTab = 'plan'"
        >
          Translation Plan
        </div>
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'architecture' }"
          @click="activeTab = 'architecture'"
        >
          Architecture
        </div>
      </div>

      <div class="tab-content">
        <!-- Files Tab -->
        <div v-if="activeTab === 'files'" class="files-tab">
          <div class="file-browser">
            <div class="file-tree">
              <div class="file-list-header">
                <h4>Translated Files</h4>
                <div class="filter-input">
                  <input 
                    type="text" 
                    v-model="fileFilter" 
                    placeholder="Filter files..."
                    class="filter-field"
                  />
                </div>
              </div>
              <div class="file-list">
                <div 
                  v-for="file in filteredFiles" 
                  :key="file.path"
                  class="file-item"
                  :class="{ 'active': selectedFile === file.path, 'has-error': file.error }"
                  @click="selectFile(file.path)"
                >
                  <div class="file-item-icon">
                    <svg v-if="file.error" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div class="file-item-name">{{ getFileName(file.path) }}</div>
                  <div class="file-item-actions">
                    <button 
                      class="file-action" 
                      title="Download file"
                      @click.stop="downloadFile(file.path)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="file-preview">
              <div class="file-preview-header">
                <div class="file-preview-name">{{ selectedFile ? getFileName(selectedFile) : 'Select a file' }}</div>
                <div class="file-preview-actions">
                  <button 
                    v-if="selectedFile" 
                    class="preview-action" 
                    title="Download file"
                    @click="downloadFile(selectedFile)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </button>
                </div>
              </div>
              <div class="file-preview-content">
                <pre v-if="selectedFile && getFileContent(selectedFile)" class="code-preview"><code v-html="formatCode(getFileContent(selectedFile), getFileExtension(selectedFile))"></code></pre>
                <div v-else class="empty-preview">
                  <p>Select a file to view its translated content</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Translation Plan Tab -->
        <div v-else-if="activeTab === 'plan'" class="plan-tab">
          <div class="plan-content">
            <pre class="translation-plan" v-if="processingStore.translationPlan"><code v-html="formatMarkdown(processingStore.translationPlan)"></code></pre>
            <div class="empty-plan" v-else>
              <p>No translation plan was generated.</p>
            </div>
          </div>
        </div>

        <!-- Architecture Tab -->
        <div v-else-if="activeTab === 'architecture'" class="architecture-tab">
          <div class="architecture-content">
            <pre class="architecture-recommendations" v-if="processingStore.architectureRecommendations"><code v-html="formatMarkdown(processingStore.architectureRecommendations)"></code></pre>
            <div class="empty-architecture" v-else>
              <p>No architecture recommendations were generated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="processingStore.errors.length > 0" class="error-container">
      <div class="error-header">
        <h4>Errors Occurred During Translation</h4>
      </div>
      <div class="error-list">
        <div v-for="(error, index) in processingStore.errors" :key="index" class="error-item">
          <div class="error-phase">{{ error.phase }}</div>
          <div class="error-message">{{ error.message }}</div>
          <div v-if="error.file" class="error-file">File: {{ error.file }}</div>
        </div>
      </div>
      <div class="error-actions">
        <button class="retry-button" @click="$emit('retry')">
          Retry Translation
        </button>
      </div>
    </div>

    <div v-else class="empty-results">
      <p>No translation results available. Start a translation to see results here.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProcessingStore } from '../../stores/processing';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { marked } from 'marked';

// Props and emits
const emit = defineEmits(['retry']);

// Stores
const processingStore = useProcessingStore();

// Local state
const activeTab = ref('files');
const selectedFile = ref(null);
const fileFilter = ref('');

// Computed properties
const filteredFiles = computed(() => {
  if (!processingStore.processingQueue.length) return [];
  
  const filter = fileFilter.value.toLowerCase();
  return processingStore.processingQueue
    .filter(file => !filter || file.path.toLowerCase().includes(filter))
    .sort((a, b) => {
      // Sort by error status first (errors at the top)
      if (a.error && !b.error) return -1;
      if (!a.error && b.error) return 1;
      // Then sort alphabetically by path
      return a.path.localeCompare(b.path);
    });
});

// Helper methods
const getFileName = (path) => {
  if (!path) return '';
  return path.split('/').pop();
};

const getFileExtension = (path) => {
  if (!path) return '';
  return path.split('.').pop();
};

const getFileContent = (path) => {
  return processingStore.getTranslatedContent(path);
};

const downloadFile = (path) => {
  processingStore.downloadFile(path);
};

const downloadAllAsZip = async () => {
    this.processingStore.downloadZip('transfusion-translated-files.zip');
};

const selectFile = (path) => {
  selectedFile.value = path;
};

// Code formatting functions
const formatCode = (code, extension) => {
  if (!code) return '';
  
  let language;
  switch (extension) {
    case 'js':
      language = 'javascript';
      break;
    case 'jsx':
      language = 'jsx';
      break;
    case 'ts':
      language = 'typescript';
      break;
    case 'tsx':
      language = 'tsx';
      break;
    case 'vue':
      language = 'html';
      break;
    case 'svelte':
      language = 'html';
      break;
    case 'css':
      language = 'css';
      break;
    case 'scss':
      language = 'scss';
      break;
    case 'html':
      language = 'html';
      break;
    case 'json':
      language = 'json';
      break;
    default:
      language = 'plaintext';
  }
  
  try {
    const highlighted = hljs.highlight(code, { language }).value;
    return highlighted;
  } catch (error) {
    console.warn('Error highlighting code:', error);
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

const formatMarkdown = (markdown) => {
  if (!markdown) return '';
  
  try {
    // Set up marked to highlight code blocks
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      }
    });
    
    return marked(markdown);
  } catch (error) {
    console.warn('Error parsing markdown:', error);
    return markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Initialize component
onMounted(() => {
  // If there are processed files, select the first one by default
  if (filteredFiles.value.length > 0) {
    selectFile(filteredFiles.value[0].path);
  }
});
</script>

<style scoped>
.translation-results {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.results-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #4776E6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #3a67d7;
  box-shadow: 0 2px 4px rgba(71, 118, 230, 0.2);
}

/* Processing Status */
.processing-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.progress-container {
  width: 80%;
  max-width: 500px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #4776E6;
  min-width: 40px;
  text-align: right;
}

.status-message {
  font-size: 1.1rem;
  color: #64748b;
  text-align: center;
}

/* Results Container */
.results-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs {
  display: flex;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.tab {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: #334155;
  background-color: rgba(255, 255, 255, 0.5);
}

.tab.active {
  color: #4776E6;
  border-bottom-color: #4776E6;
  background-color: white;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Files Tab */
.files-tab {
  height: 100%;
  overflow: hidden;
}

.file-browser {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 100%;
  overflow: hidden;
}

.file-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #e2e8f0;
  background-color: white;
  overflow: hidden;
}

.file-list-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.file-list-header h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #334155;
}

.filter-input {
  width: 100%;
}

.filter-field {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.25rem;
  color: #334155;
}

.file-item:hover {
  background-color: #f1f5f9;
}

.file-item.active {
  background-color: #e0e7ff;
  color: #4776E6;
}

.file-item.has-error {
  color: #ef4444;
}

.file-item-icon {
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
}

.file-item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.file-item-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-item-actions {
  opacity: 1;
}

.file-action {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.file-action:hover {
  background-color: #e2e8f0;
  color: #334155;
}

.file-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.file-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.file-preview-name {
  font-weight: 500;
  color: #334155;
}

.file-preview-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-action {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-action:hover {
  background-color: #e2e8f0;
}

.file-preview-content {
  flex: 1;
  overflow: auto;
  position: relative;
  background-color: #0f172a;
  max-height: 800px;
}

.code-preview {
  margin: 0;
  padding: 1rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #f8fafc;
  counter-reset: line;
}

.code-preview code {
  white-space: pre;
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  color: #64748b;
  background-color: #f8fafc;
}

/* Plan Tab */
.plan-tab, .architecture-tab {
  height: 100%;
  overflow: auto;
  padding: 1.5rem;
}

.translation-plan, .architecture-recommendations {
  margin: 0;
  padding: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Markdown content styling */
.translation-plan :deep(h1),
.translation-plan :deep(h2),
.translation-plan :deep(h3),
.translation-plan :deep(h4),
.architecture-recommendations :deep(h1),
.architecture-recommendations :deep(h2),
.architecture-recommendations :deep(h3),
.architecture-recommendations :deep(h4) {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #1e293b;
}

.translation-plan :deep(h1),
.architecture-recommendations :deep(h1) {
  font-size: 1.8rem;
}

.translation-plan :deep(h2),
.architecture-recommendations :deep(h2) {
  font-size: 1.5rem;
}

.translation-plan :deep(h3),
.architecture-recommendations :deep(h3) {
  font-size: 1.25rem;
}

.translation-plan :deep(h4),
.architecture-recommendations :deep(h4) {
  font-size: 1.1rem;
}

.translation-plan :deep(p),
.architecture-recommendations :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.translation-plan :deep(ul), .translation-plan :deep(ol),
.architecture-recommendations :deep(ul), .architecture-recommendations :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.translation-plan :deep(li),
.architecture-recommendations :deep(li) {
  margin-bottom: 0.5rem;
}

.translation-plan :deep(pre),
.architecture-recommendations :deep(pre) {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #0f172a;
  border-radius: 6px;
  overflow-x: auto;
}

.translation-plan :deep(code),
.architecture-recommendations :deep(code) {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9rem;
  color: #f8fafc;
}

.translation-plan :deep(blockquote),
.architecture-recommendations :deep(blockquote) {
  margin: 0 0 1rem 0;
  padding: 0.5rem 1.5rem;
  border-left: 4px solid #4776E6;
  background-color: #f1f5f9;
}

.empty-plan, .empty-architecture {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  color: #64748b;
}

/* Error Container */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.error-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.error-header h4 {
  color: #ef4444;
  font-size: 1.2rem;
  margin: 0;
}

.error-list {
  flex: 1;
  overflow-y: auto;
}

.error-item {
  background-color: #fff0f0;
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.error-phase {
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.error-message {
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.error-file {
  font-size: 0.9rem;
  color: #64748b;
}

.error-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background-color: #dc2626;
}

/* Empty Results */
.empty-results {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #64748b;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .file-browser {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .file-tree {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    max-height: 200px;
  }
}
</style>