<template>
    <div class="file-viewer">
      <div v-if="!node || !node.content" class="empty-state">
        <p>Select a file to view its contents</p>
      </div>
      <div v-else class="file-content">
        <div class="file-preview-header">
          <div class="file-preview-name">{{ node.name || 'File' }}</div>
          </div>
        <div class="file-preview-content">
           <pre class="code-preview"><code v-html="formatCode(node.content, node.extension)"></code></pre>
        </div>
      </div>
    </div>
  </template>
 
  <script setup>
  import { computed } from 'vue';
  import hljs from 'highlight.js'; // Assuming you want highlighting
  import 'highlight.js/styles/atom-one-dark.css'; // Example style
 
  // Define component props - Keep 'node' as expected by the parent now
  const props = defineProps({
    node: {
      type: Object, // Expecting the file object here
      default: null // Default to null if no file is selected
    }
  });
 
  // Formatting function (keep or adapt as needed)
   const formatCode = (code, extension) => {
     if (!code) return '';
     let language = 'plaintext';
     // Determine language based on extension (add more mappings as needed)
     const ext = extension?.toLowerCase();
     if (ext === 'js' || ext === 'jsx') language = 'javascript';
     else if (ext === 'ts' || ext === 'tsx') language = 'typescript';
     else if (ext === 'vue') language = 'html'; // HLJS often uses html for vue templates
     else if (ext === 'css') language = 'css';
     else if (ext === 'json') language = 'json';
     else if (ext === 'html') language = 'html';
 
     try {
         if (hljs.getLanguage(language)) {
              return hljs.highlight(code, { language }).value;
         }
         return hljs.highlightAuto(code).value; // Fallback to auto-detect
     } catch (error) {
         console.warn('Error highlighting code:', error);
          // Basic escaping as fallback
          return code
             .replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
     }
 };
 
  </script>
 
  <style scoped>
   
   .file-viewer {
       height: 100%;
       display: flex;
       flex-direction: column;
   }
    .empty-state {
       display: flex;
       align-items: center;
       justify-content: center;
       height: 100%;
       padding: 2rem;
       color: #64748b;
       background-color: #f8fafc;
       border-radius: 0 0 8px 8px; /* Match container */
    }
    .file-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .file-preview-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 0.75rem 1rem;
       background-color: #f8fafc;
       border-bottom: 1px solid #e2e8f0;
       color: #334155;
       font-weight: 500;
    }
     .file-preview-content {
        flex: 1;
        overflow: auto;
        max-height: 300px;
        position: relative;
        background-color: #0f172a; /* Dark background for code */
    }
    .code-preview {
        margin: 0;
        padding: 1rem;
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 0.9rem;
        line-height: 1.5;
        color: #f8fafc;
        max-height: 50%;
    }
    .code-preview code {
        white-space: pre;
    }
    /* Add styles for syntax highlighting spans if using formatCode */
     .code-preview :deep(.code-string) { color: #f1fa8c; }
     .code-preview :deep(.code-keyword) { color: #ff79c6; }
     .code-preview :deep(.code-function) { color: #8be9fd; }
     .code-preview :deep(.code-comment) { color: #6272a4; font-style: italic; }
     .code-preview :deep(.code-tag) { color: #ff79c6; }
     .code-preview :deep(.code-attr) { color: #50fa7b; }
     .code-preview :deep(.code-expression) { color: #f1fa8c; }
     /* Add other highlighting styles as needed */
 
  </style>