<template>
    <div class="tree-node" :style="{ paddingLeft: `${level * 16}px` }">
      <div 
        class="node-content" 
        :class="{ 'directory': node.type === 'directory', 'file': node.type === 'file', 'selected': isSelected }"
        @click="handleNodeClick"
      >
        <div class="node-icon">
          <svg v-if="node.type === 'directory'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="isExpanded" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <path v-else d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <svg v-else-if="node.type === 'file'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        
        <div class="node-label">{{ node.name }}</div>
        
        <div v-if="node.type === 'directory' && node.children && node.children.length > 0" class="expand-icon" @click.stop="toggleExpand">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline v-if="isExpanded" points="18 15 12 9 6 15"></polyline>
            <polyline v-else points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      <div v-if="isExpanded && node.children" class="node-children">
        <TreeNode 
          v-for="child in node.children" 
          :key="child.path || child.name"
          :node="child"
          :level="level + 1"
          :expanded-nodes="expandedNodes"
          :selected-path="selectedPath"
          @toggle-expand="onToggleExpand"
          @select-file="onSelectFile"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
    
  defineOptions({
    name: 'TreeNode'
    });
    
  // Define component props
  const props = defineProps({
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    expandedNodes: {
      type: Set,
      default: () => new Set()
    },
    selectedPath: {
      type: String,
      default: null
    }
  });
  
  // Define component events
  const emit = defineEmits(['toggle-expand', 'select-file']);
  
  // Computed properties
  const nodePath = computed(() => {
    if (props.node.path) {
      return props.node.path;
    }
    return props.node.name === 'root' ? 'root' : props.node.name;
  });
  
  const isExpanded = computed(() => {
    return props.expandedNodes.has(nodePath.value);
  });
  
  const isSelected = computed(() => {
    return props.selectedPath === nodePath.value;
  });
  
  // Event handlers
  const toggleExpand = () => {
    emit('toggle-expand', nodePath.value);
  };
  
  const handleNodeClick = () => {
    if (props.node.type === 'directory') {
      toggleExpand();
    } else if (props.node.type === 'file') {
      emit('select-file', props.node);
    }
  };
  
  const onToggleExpand = (path) => {
    emit('toggle-expand', path);
  };
  
  const onSelectFile = (file) => {
    emit('select-file', file);
  };
  </script>
  
  <style scoped>
  .tree-node {
    position: relative;
  }
  
  .node-content {
    display: flex;
    align-items: center;
    padding: 0.35rem 0.5rem;
    margin: 2px 0;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .node-content:hover {
    background-color: #e2e8f0;
  }
  
  .node-content.directory {
    font-weight: 500;
    color: #334155;
  }
  
  .node-content.file {
    color: #64748b;
  }
  
  .node-content.selected {
    background-color: #cbd5e1;
  }
  
  .node-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.5rem;
  }
  
  .node-icon svg {
    color: inherit;
  }
  
  .directory .node-icon svg {
    color: #f59e0b;
  }
  
  .file .node-icon svg {
    color: #64748b;
  }
  
  .node-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .expand-icon {
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: #94a3b8;
  }
  
  /* Apply different colors based on file extensions */
  .file[data-ext="js"] .node-icon, 
  .file[data-ext="jsx"] .node-icon {
    color: #eab308;
  }
  
  .file[data-ext="ts"] .node-icon, 
  .file[data-ext="tsx"] .node-icon {
    color: #3b82f6;
  }
  
  .file[data-ext="vue"] .node-icon {
    color: #42b883;
  }
  
  .file[data-ext="html"] .node-icon {
    color: #ef4444;
  }
  
  .file[data-ext="css"] .node-icon {
    color: #0ea5e9;
  }
  
  .file[data-ext="svg"] .node-icon {
    color: #8b5cf6;
  }
  </style>