// stores/project.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useProjectStore = defineStore('project', () => {
  // State
  const sourceFramework = ref(null);
  const targetFramework = ref(null);
  const projectName = ref('');
  const projectDescription = ref('');
  const frameworkOptions = ref([
    {
      id: 'react',
      name: 'React',
      versions: ['16', '17', '18'],
      options: {
        typescript: false,
        cssInJs: false,
        stateManagement: 'none' // 'redux', 'mobx', 'context', 'none'
      }
    },
    {
      id: 'vue',
      name: 'Vue',
      versions: ['2', '3'],
      options: {
        typescript: false,
        compositionApi: true,
        stateManagement: 'pinia' // 'pinia', 'vuex', 'none'
      }
    },
    {
      id: 'angular',
      name: 'Angular',
      versions: ['13', '14', '15', '16'],
      options: {
        standalone: false
      }
    },
    {
      id: 'svelte',
      name: 'Svelte',
      versions: ['3', '4'],
      options: {
        typescript: false,
        kit: false
      }
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      versions: ['12', '13', '14'],
      options: {
        typescript: false,
        appDir: false
      }
    },
    {
      id: 'nuxt',
      name: 'Nuxt',
      versions: ['2', '3'],
      options: {
        typescript: false
      }
    }
  ]);
  
  // Selected framework options
  const sourceOptions = ref({});
  const targetOptions = ref({});
  
  // Getters
  const isFrameworkSelected = computed(() => 
    sourceFramework.value !== null && targetFramework.value !== null
  );
  
  const selectedSourceFramework = computed(() => 
    frameworkOptions.value.find(f => f.id === sourceFramework.value) || null
  );
  
  const selectedTargetFramework = computed(() => 
    frameworkOptions.value.find(f => f.id === targetFramework.value) || null
  );
  
  const translationPair = computed(() => {
    if (!sourceFramework.value || !targetFramework.value) return null;
    return `${sourceFramework.value}-to-${targetFramework.value}`;
  });

  // Actions
  /**
   * Set the source framework
   * @param {string} frameworkId - Framework ID
   */
  function setSourceFramework(frameworkId) {
    if (frameworkId === targetFramework.value) {
      return false; // Can't set same framework as source and target
    }
    
    sourceFramework.value = frameworkId;
    
    // Initialize default options for this framework
    if (frameworkId) {
      const framework = frameworkOptions.value.find(f => f.id === frameworkId);
      if (framework) {
        sourceOptions.value = { ...framework.options };
        // Set default version to latest
        sourceOptions.value.version = framework.versions[framework.versions.length - 1];
      }
    }
    
    return true;
  }
  
  /**
   * Set the target framework
   * @param {string} frameworkId - Framework ID
   */
  function setTargetFramework(frameworkId) {
    if (frameworkId === sourceFramework.value) {
      return false; // Can't set same framework as source and target
    }
    
    targetFramework.value = frameworkId;
    
    // Initialize default options for this framework
    if (frameworkId) {
      const framework = frameworkOptions.value.find(f => f.id === frameworkId);
      if (framework) {
        targetOptions.value = { ...framework.options };
        // Set default version to latest
        targetOptions.value.version = framework.versions[framework.versions.length - 1];
      }
    }
    
    return true;
  }
  
  /**
   * Update source framework options
   * @param {Object} options - Framework options
   */
  function updateSourceOptions(options) {
    sourceOptions.value = { ...sourceOptions.value, ...options };
  }
  
  /**
   * Update target framework options
   * @param {Object} options - Framework options
   */
  function updateTargetOptions(options) {
    targetOptions.value = { ...targetOptions.value, ...options };
  }
  
  /**
   * Set project metadata
   * @param {Object} metadata - Project metadata
   */
  function setProjectMetadata({ name, description }) {
    projectName.value = name || projectName.value;
    projectDescription.value = description || projectDescription.value;
  }

  /**
   * Reset project state
   */
  function resetProject() {
    sourceFramework.value = null;
    targetFramework.value = null;
    projectName.value = '';
    projectDescription.value = '';
    sourceOptions.value = {};
    targetOptions.value = {};
  }

  return {
    // State
    sourceFramework,
    targetFramework,
    projectName,
    projectDescription,
    frameworkOptions,
    sourceOptions,
    targetOptions,
    
    // Getters
    isFrameworkSelected,
    selectedSourceFramework,
    selectedTargetFramework,
    translationPair,
    
    // Actions
    setSourceFramework,
    setTargetFramework,
    updateSourceOptions,
    updateTargetOptions,
    setProjectMetadata,
    resetProject
  };
});