<template>
    <div class="translation-options">
      <div class="options-header">
        <h3>Translation Options</h3>
        <p class="options-description">
          Configure how your code will be translated from {{ sourceFrameworkName }} to {{ targetFrameworkName }}
        </p>
      </div>
  
      <div class="options-container">
        <!-- Source Framework Options -->
        <div class="framework-options source-options">
          <h4>{{ sourceFrameworkName }} Options</h4>
          <div class="options-grid">
            <!-- Source Framework Version -->
            <div class="option-item">
              <label>Version</label>
              <select v-model="localSourceOptions.version">
                <option 
                  v-for="version in sourceFrameworkVersions" 
                  :key="`source-version-${version}`" 
                  :value="version"
                >
                  {{ sourceFrameworkName }} {{ version }}
                </option>
              </select>
              <span class="option-help">
                Select the version of {{ sourceFrameworkName }} your code is using
              </span>
            </div>
  
            <!-- React-specific options -->
            <template v-if="sourceFramework === 'react'">
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localSourceOptions.typescript">
                  TypeScript
                </label>
                <span class="option-help">
                  Check if your React code is using TypeScript
                </span>
              </div>
              
              <div class="option-item">
                <label>State Management</label>
                <select v-model="localSourceOptions.stateManagement">
                  <option value="none">React Hooks</option>
                  <option value="redux">Redux</option>
                  <option value="context">Context API</option>
                  <option value="mobx">MobX</option>
                </select>
                <span class="option-help">
                  Select the state management solution used in your React code
                </span>
              </div>
              
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localSourceOptions.cssInJs">
                  CSS-in-JS
                </label>
                <span class="option-help">
                  Check if your React code uses styled-components, emotion, or other CSS-in-JS libraries
                </span>
              </div>
            </template>
  
            <!-- Vue-specific options -->
            <template v-if="sourceFramework === 'vue'">
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localSourceOptions.typescript">
                  TypeScript
                </label>
                <span class="option-help">
                  Check if your Vue code is using TypeScript
                </span>
              </div>
              
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localSourceOptions.compositionApi">
                  Composition API
                </label>
                <span class="option-help">
                  Check if your Vue code uses the Composition API (Vue 3 style)
                </span>
              </div>
              
              <div class="option-item">
                <label>State Management</label>
                <select v-model="localSourceOptions.stateManagement">
                  <option value="none">None</option>
                  <option value="vuex">Vuex</option>
                  <option value="pinia">Pinia</option>
                </select>
                <span class="option-help">
                  Select the state management solution used in your Vue code
                </span>
              </div>
            </template>
  
            <!-- Angular-specific options -->
            <template v-if="sourceFramework === 'angular'">
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localSourceOptions.standalone">
                  Standalone Components
                </label>
                <span class="option-help">
                  Check if your Angular code uses standalone components (Angular 14+)
                </span>
              </div>
              
              <div class="option-item">
                <label>State Management</label>
                <select v-model="localSourceOptions.stateManagement">
                  <option value="none">Services only</option>
                  <option value="ngrx">NgRx</option>
                  <option value="ngxs">NGXS</option>
                </select>
                <span class="option-help">
                  Select the state management solution used in your Angular code
                </span>
              </div>
            </template>
  
            <!-- Svelte-specific options -->
            <template v-if="sourceFramework === 'svelte'">
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localSourceOptions.typescript">
                  TypeScript
                </label>
                <span class="option-help">
                  Check if your Svelte code is using TypeScript
                </span>
              </div>
              
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localSourceOptions.kit">
                  SvelteKit
                </label>
                <span class="option-help">
                  Check if your Svelte code is using SvelteKit
                </span>
              </div>
            </template>
          </div>
        </div>
  
        <!-- Target Framework Options -->
        <div class="framework-options target-options">
          <h4>{{ targetFrameworkName }} Options</h4>
          <div class="options-grid">
            <!-- Target Framework Version -->
            <div class="option-item">
              <label>Version</label>
              <select v-model="localTargetOptions.version">
                <option 
                  v-for="version in targetFrameworkVersions" 
                  :key="`target-version-${version}`" 
                  :value="version"
                >
                  {{ targetFrameworkName }} {{ version }}
                </option>
              </select>
              <span class="option-help">
                Select the version of {{ targetFrameworkName }} for your translated code
              </span>
            </div>
  
            <!-- React-specific options (as target) -->
            <template v-if="targetFramework === 'react'">
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localTargetOptions.typescript">
                  TypeScript
                </label>
                <span class="option-help">
                  Check to generate React code with TypeScript
                </span>
              </div>
              
              <div class="option-item">
                <label>State Management</label>
                <select v-model="localTargetOptions.stateManagement">
                  <option value="none">React Hooks</option>
                  <option value="redux">Redux</option>
                  <option value="context">Context API</option>
                  <option value="mobx">MobX</option>
                </select>
                <span class="option-help">
                  Select the state management solution for your React code
                </span>
              </div>
              
              <div class="option-item">
                <label>Component Style</label>
                <select v-model="localTargetOptions.componentStyle">
                  <option value="functional">Functional Components</option>
                  <option value="class">Class Components</option>
                </select>
                <span class="option-help">
                  Select the component style for your React code
                </span>
              </div>
            </template>
  
            <!-- Vue-specific options (as target) -->
            <template v-if="targetFramework === 'vue'">
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localTargetOptions.typescript">
                  TypeScript
                </label>
                <span class="option-help">
                  Check to generate Vue code with TypeScript
                </span>
              </div>
              
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localTargetOptions.compositionApi">
                  Composition API
                </label>
                <span class="option-help">
                  Check to use the Composition API (recommended for Vue 3)
                </span>
              </div>
              
              <div class="option-item">
                <label>State Management</label>
                <select v-model="localTargetOptions.stateManagement">
                  <option value="none">None</option>
                  <option value="vuex">Vuex</option>
                  <option value="pinia">Pinia</option>
                </select>
                <span class="option-help">
                  Select the state management solution for your Vue code
                </span>
              </div>
            </template>
  
            <!-- Angular-specific options (as target) -->
            <template v-if="targetFramework === 'angular'">
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localTargetOptions.standalone">
                  Standalone Components
                </label>
                <span class="option-help">
                  Check to generate Angular code with standalone components (Angular 14+)
                </span>
              </div>
              
              <div class="option-item">
                <label>State Management</label>
                <select v-model="localTargetOptions.stateManagement">
                  <option value="none">Services only</option>
                  <option value="ngrx">NgRx</option>
                  <option value="ngxs">NGXS</option>
                </select>
                <span class="option-help">
                  Select the state management solution for your Angular code
                </span>
              </div>
              
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localTargetOptions.strictMode">
                  Strict Mode
                </label>
                <span class="option-help">
                  Check to enable strict type checking in Angular
                </span>
              </div>
            </template>
  
            <!-- Svelte-specific options (as target) -->
            <template v-if="targetFramework === 'svelte'">
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localTargetOptions.typescript">
                  TypeScript
                </label>
                <span class="option-help">
                  Check to generate Svelte code with TypeScript
                </span>
              </div>
              
              <div class="option-item">
                <label>
                  <input type="checkbox" v-model="localTargetOptions.kit">
                  SvelteKit
                </label>
                <span class="option-help">
                  Check to use SvelteKit for your Svelte application
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
  
      <!-- Translation Strategy Options -->
      <div class="translation-strategy">
        <h4>Translation Strategy</h4>
        <div class="strategy-options">
          <div class="option-item full-width">
            <label>Code Style</label>
            <select v-model="translationStrategy.codeStyle">
              <option value="idiomatic">Idiomatic {{ targetFrameworkName }}</option>
              <option value="similar">Similar to Source</option>
              <option value="optimized">Optimized for Performance</option>
            </select>
            <span class="option-help">
              Choose how closely the translated code should follow {{ targetFrameworkName }} idioms vs. source structure
            </span>
          </div>
          
          <div class="option-item">
            <label>
              <input type="checkbox" v-model="translationStrategy.preserveComments">
              Preserve Comments
            </label>
            <span class="option-help">
              Maintain original code comments in the translated files
            </span>
          </div>
          
          <div class="option-item">
            <label>
              <input type="checkbox" v-model="translationStrategy.generateTests">
              Generate Tests
            </label>
            <span class="option-help">
              Generate basic tests for the translated components
            </span>
          </div>
  
          <div class="option-item full-width">
            <label>Special Instructions</label>
            <textarea 
              v-model="translationStrategy.specialInstructions" 
              placeholder="Any additional instructions for the translation process..."
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>
  
      <div class="options-actions">
        <button class="apply-btn" @click="applyChanges">Apply Settings</button>
        <button class="reset-btn" @click="resetToDefaults">Reset to Defaults</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useProjectStore } from '../../stores/project';
  
  const props = defineProps({
    sourceFramework: {
      type: String,
      required: true
    },
    targetFramework: {
      type: String,
      required: true
    },
    sourceOptions: {
      type: Object,
      default: () => ({})
    },
    targetOptions: {
      type: Object,
      default: () => ({})
    }
  });
  
  const emit = defineEmits(['update:sourceOptions', 'update:targetOptions', 'update:translationStrategy']);
  
  const projectStore = useProjectStore();
  
  // Local copies of options that we'll update
  const localSourceOptions = ref({...props.sourceOptions});
  const localTargetOptions = ref({...props.targetOptions});
  const translationStrategy = ref({
    codeStyle: 'idiomatic',
    preserveComments: true,
    generateTests: false,
    specialInstructions: ''
  });
  
  // Watch for prop changes to update local state
  watch(() => props.sourceOptions, (newVal) => {
    localSourceOptions.value = {...newVal};
  }, { deep: true });
  
  watch(() => props.targetOptions, (newVal) => {
    localTargetOptions.value = {...newVal};
  }, { deep: true });
  
  // Framework versions available
  const sourceFrameworkVersions = computed(() => {
    const framework = projectStore.frameworkOptions.find(f => f.id === props.sourceFramework);
    return framework ? framework.versions : [];
  });
  
  const targetFrameworkVersions = computed(() => {
    const framework = projectStore.frameworkOptions.find(f => f.id === props.targetFramework);
    return framework ? framework.versions : [];
  });
  
  // Framework display names
  const sourceFrameworkName = computed(() => {
    const framework = projectStore.frameworkOptions.find(f => f.id === props.sourceFramework);
    return framework ? framework.name : props.sourceFramework;
  });
  
  const targetFrameworkName = computed(() => {
    const framework = projectStore.frameworkOptions.find(f => f.id === props.targetFramework);
    return framework ? framework.name : props.targetFramework;
  });
  
  // Framework-specific default options
  function getDefaultOptions(frameworkId) {
    const framework = projectStore.frameworkOptions.find(f => f.id === frameworkId);
    if (!framework) return {};
    
    // Return default options for the framework
    return {...framework.options};
  }
  
  // Apply changes back to parent
  function applyChanges() {
    emit('update:sourceOptions', localSourceOptions.value);
    emit('update:targetOptions', localTargetOptions.value);
    emit('update:translationStrategy', translationStrategy.value);
  }
  
  // Reset to default options for the selected frameworks
  function resetToDefaults() {
    localSourceOptions.value = getDefaultOptions(props.sourceFramework);
    localTargetOptions.value = getDefaultOptions(props.targetFramework);
    
    translationStrategy.value = {
      codeStyle: 'idiomatic',
      preserveComments: true,
      generateTests: false,
      specialInstructions: ''
    };
    
    applyChanges();
  }
  
  // Initialize default options if not provided
  onMounted(() => {
    // If no options are provided, set defaults
    if (Object.keys(localSourceOptions.value).length === 0) {
      localSourceOptions.value = getDefaultOptions(props.sourceFramework);
    }
    
    if (Object.keys(localTargetOptions.value).length === 0) {
      localTargetOptions.value = getDefaultOptions(props.targetFramework);
    }
    
    // Set smart defaults based on framework combinations
    setSmartDefaults();
  });
  
  // Set smart defaults based on framework combinations
  function setSmartDefaults() {
    const source = props.sourceFramework;
    const target = props.targetFramework;
    
    // React to Vue defaults
    if (source === 'react' && target === 'vue') {
      if (localSourceOptions.value.stateManagement === 'redux') {
        localTargetOptions.value.stateManagement = 'pinia';
      } else if (localSourceOptions.value.stateManagement === 'context') {
        localTargetOptions.value.stateManagement = 'pinia';
      }
      
      // Default to composition API for modern conversions
      localTargetOptions.value.compositionApi = true;
    }
    
    // Vue to React defaults
    if (source === 'vue' && target === 'react') {
      if (localSourceOptions.value.stateManagement === 'pinia' || 
          localSourceOptions.value.stateManagement === 'vuex') {
        localTargetOptions.value.stateManagement = 'redux';
      }
      
      // Default to functional components
      localTargetOptions.value.componentStyle = 'functional';
    }
    
    // Preserve TypeScript status
    if (localSourceOptions.value.typescript) {
      localTargetOptions.value.typescript = true;
    }
    
    applyChanges();
  }
  </script>
  
  <style scoped>
  .translation-options {
    background-color: #f8fafc;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .options-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .options-header h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
    color: #1e293b;
  }
  
  .options-description {
    color: #64748b;
    font-size: 0.9rem;
    margin: 0;
  }
  
  .options-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .framework-options {
    background-color: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .framework-options h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #334155;
    font-weight: 600;
  }
  
  .source-options {
    border-left: 3px solid #4776E6;
  }
  
  .target-options {
    border-left: 3px solid #8E54E9;
  }
  
  .options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .option-item {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .option-item label {
    font-weight: 500;
    color: #475569;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .option-help {
    font-size: 0.75rem;
    color: #94a3b8;
  }
  
  .option-item select,
  .option-item input[type="text"],
  .option-item textarea {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 0.9rem;
    background-color: #f8fafc;
    color: #1e293b;
  }
  
  .option-item textarea {
    resize: vertical;
    min-height: 60px;
  }
  
  /* Translation strategy section */
  .translation-strategy {
    background-color: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
    border-left: 3px solid #10b981;
  }
  
  .translation-strategy h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #334155;
    font-weight: 600;
  }
  
  .strategy-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .full-width {
    grid-column: span 2;
  }
  
  /* Action buttons */
  .options-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  .apply-btn, .reset-btn {
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .apply-btn {
    background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
    color: white;
    border: none;
  }
  
  .apply-btn:hover {
    box-shadow: 0 4px 6px rgba(71, 118, 230, 0.2);
    transform: translateY(-1px);
  }
  
  .reset-btn {
    background-color: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }
  
  .reset-btn:hover {
    background-color: #f1f5f9;
    color: #475569;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .options-container,
    .strategy-options {
      grid-template-columns: 1fr;
    }
    
    .full-width {
      grid-column: auto;
    }
    
    .options-actions {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .apply-btn, .reset-btn {
      width: 100%;
    }
  }
  </style>