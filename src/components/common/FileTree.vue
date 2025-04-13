<template>
    <div class="file-tree-container">
      <div v-if="!treeData  || !treeData.children || treeData.children.length === 0" class="empty-state">
        <p>No files uploaded yet</p>
      </div>
      <div v-else class="file-tree">
        <div class="tree-header">
          <h3>Project Files</h3>
          <div class="tree-actions">
            <button class="tree-action-btn" @click="expandAll">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <button class="tree-action-btn" @click="collapseAll">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="tree-content">
          <TreeNode 
            v-if="treeData" 
            :node="treeData" 
            :level="0"
            :expanded-nodes="expandedNodes"
            @toggle-expand="toggleNodeExpand"
            @select-file="handleFileSelect"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits, onMounted, watch } from 'vue';
  import TreeNode from './TreeNode.vue';
  
  const props = defineProps({
    treeData: {
      type: Object,
      default: null
    },
    selectedFile: {
      type: Object,
      default: null
    }
  });
  
  const emit = defineEmits(['file-select']);
  
  // Keep track of expanded nodes
  const expandedNodes = ref(new Set(['root'])); // Root is expanded by default
  
  // Event handlers
  const toggleNodeExpand = (nodePath) => {
    if (expandedNodes.value.has(nodePath)) {
      expandedNodes.value.delete(nodePath);
    } else {
      expandedNodes.value.add(nodePath);
    }
  };
  
  const expandAll = () => {
    // Reset expanded nodes
    expandedNodes.value = new Set(['root']);
    
    // Traverse tree and expand all directories
    const traverseAndExpand = (node, currentPath = '') => {
      if (node.type === 'directory') {
        const path = currentPath ? `${currentPath}/${node.name}` : node.name;
        expandedNodes.value.add(path);
        
        if (node.children) {
          node.children.forEach(child => {
            if (child.type === 'directory') {
              traverseAndExpand(child, path);
            }
          });
        }
      }
    };
    
    if (props.treeData) {
      traverseAndExpand(props.treeData);
    }
  };
  
  const collapseAll = () => {
    // Only keep root expanded
    expandedNodes.value = new Set(['root']);
  };
  
  const handleFileSelect = (file) => {
    emit('file-select', file);
  };
  
  // Auto-expand parent directories of selected file
  watch(() => props.selectedFile, (newFile) => {
    if (newFile) {
      const path = newFile.path;
      const parts = path.split('/');
      
      // Expand all parent directories
      let currentPath = '';
      for (let i = 0; i < parts.length - 1; i++) {
        if (i === 0) {
          currentPath = parts[i];
        } else {
          currentPath = `${currentPath}/${parts[i]}`;
        }
        expandedNodes.value.add(currentPath);
      }
    }
  }, { immediate: true });
  
  onMounted(() => {
    if (props.treeData) {
      // Start with root expanded
      expandedNodes.value.add('root');
    }
  });
  </script>
  
  <style scoped>
  .file-tree-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: #f8fafc;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    color: #64748b;
    text-align: center;
  }
  
  .file-tree {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .tree-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
  }
  
  .tree-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .tree-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 4px;
    background-color: transparent;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .tree-action-btn:hover {
    background-color: #e2e8f0;
    color: #1e293b;
  }
  
  .tree-content {
    flex: 1;
    overflow: auto;
    padding: 0.5rem;
  }
  </style>