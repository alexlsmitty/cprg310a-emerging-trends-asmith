/**
 * Prompt Builder Service
 * Generates intelligent prompts for code translation based on framework, files, and project structure
 */

/**
 * Analyze file contents to extract key characteristics
 * @param {Object} file - File object with content and metadata
 * @returns {Object} File analysis details
 */
function analyzeFileContent(file) {
    const analysis = {
      language: file.language || 'unknown',
      hasHooks: false,
      hasClasses: false,
      hasTypeScript: false,
      stateManagement: 'none',
      componentType: 'functional',
      importedLibraries: []
    };
  
    if (!file.content) return analysis;
  
    // Language detection
    if (file.language === 'typescript' || file.content.includes('interface ') || file.content.includes(': any')) {
      analysis.hasTypeScript = true;
    }
  
    // Hook detection (React/Vue)
    if (file.content.includes('useState') || file.content.includes('useEffect') || 
        file.content.includes('ref(') || file.content.includes('onMounted(')) {
      analysis.hasHooks = true;
    }
  
    // Class detection
    if (file.content.includes('class ') || file.content.includes('extends Component')) {
      analysis.hasClasses = true;
      analysis.componentType = 'class';
    }
  
    // State management detection
    if (file.content.includes('redux') || file.content.includes('createSlice')) {
      analysis.stateManagement = 'redux';
    } else if (file.content.includes('vuex') || file.content.includes('createStore')) {
      analysis.stateManagement = 'vuex';
    } else if (file.content.includes('pinia') || file.content.includes('defineStore')) {
      analysis.stateManagement = 'pinia';
    }
  
    // Library import detection - using a more efficient regex approach
    const importMatches = file.content.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];
    if (importMatches.length > 0) {
      analysis.importedLibraries = importMatches
        .map(match => {
          const lib = match.match(/['"]([^'"]+)['"]/);
          return lib ? lib[1] : null;
        })
        .filter(lib => lib && lib !== '.' && !lib.startsWith('./') && !lib.startsWith('../'))
        .slice(0, 5); // Limit to 5 most important libraries
    }
  
    return analysis;
  }
  
  /**
   * Build a master translation prompt
   * @param {Object} config - Translation configuration
   * @param {string} repoContent - Repository content representation
   * @returns {string} Comprehensive translation prompt
   */
  export function buildMasterPrompt(config, repoContent) {
    const { 
      sourceFramework, 
      targetFramework, 
      sourceOptions = {}, 
      targetOptions = {} 
    } = config;
  
    // Define a condensed version of framework-specific instructions
    const instructionMap = {
      'react-to-vue': 'Convert React to Vue 3 Composition API. Transform state, lifecycle, and JSX appropriately.',
      'vue-to-react': 'Convert Vue to React hooks. Migrate reactivity to useState, lifecycle to useEffect, templates to JSX.',
      'angular-to-react': 'Convert Angular to React. Transform decorators, services, and templates accordingly.',
      'react-to-angular': 'Convert React to Angular. Implement components, services, and proper dependency injection.',
      'vue-to-angular': 'Convert Vue to Angular. Transform templates, directives, and state management.',
      'angular-to-vue': 'Convert Angular to Vue 3. Transform decorators to composition API, services to composables.',
      'svelte-to-react': 'Convert Svelte to React. Transform reactive state, template syntax, and lifecycle.',
      'react-to-svelte': 'Convert React to Svelte. Transform state, hooks, and JSX to Svelte syntax.'
    };
  
    // Get specific instructions or use a generic message
    const instructions = instructionMap[`${sourceFramework}-to-${targetFramework}`] || 
      `Convert from ${sourceFramework} to ${targetFramework} following best practices.`;
  
    return `
  TRANSLATION TASK: ${sourceFramework.toUpperCase()} TO ${targetFramework.toUpperCase()} CODEBASE
  
  SOURCE: ${sourceFramework} ${sourceOptions.version || 'latest'}
  TARGET: ${targetFramework} ${targetOptions.version || 'latest'}
  
  INSTRUCTIONS: ${instructions}
  
  KEY REQUIREMENTS:
  - Maintain logic and structure
  - Follow ${targetFramework} best practices
  - Preserve comments
  - Handle imports correctly
  - TypeScript: ${sourceOptions.typescript ? 'Yes' : 'No'} → ${targetOptions.typescript ? 'Yes' : 'No'}
  - State Management: ${targetOptions.stateManagement || 'framework-native'}
  
  ${config.specialInstructions ? `SPECIAL: ${config.specialInstructions}` : ''}
  
  Please analyze the repository content and provide a translation strategy.`;
  }
  
  /**
   * Build a file-specific translation prompt with separated instruction and content
   * @param {Object} config - Translation configuration
   * @param {string} filePath - Path of the file being translated
   * @param {string} fileContent - Content of the file
   * @param {Object} dependencyInfo - Dependency information
   * @returns {Object} Object containing instruction and content for translation
   */
  export function buildFilePrompt(config, filePath, fileContent, dependencyInfo) {
    const { 
      sourceFramework, 
      targetFramework, 
      sourceOptions = {}, 
      targetOptions = {} 
    } = config;
  
    // Analyze the file
    const fileAnalysis = analyzeFileContent({ 
      content: fileContent, 
      path: filePath,
      language: filePath.split('.').pop()
    });
  
    // Determine file type
    const fileType = filePath.includes('component') ? 'component' :
                     filePath.includes('service') ? 'service' :
                     filePath.includes('hook') ? 'hook' : 'other';
  
    // Limit dependencies to key ones to reduce prompt size
    const MAX_DEPENDENCIES = 3;
    const relatedDependencies = dependencyInfo?.dependencyGraph?.[filePath]?.imports || [];
    const limitedDependencies = relatedDependencies.slice(0, MAX_DEPENDENCIES);
    const depCount = relatedDependencies.length - limitedDependencies.length;
    const depText = limitedDependencies.length > 0 
      ? `Related: ${limitedDependencies.join(', ')}${depCount > 0 ? ` (+${depCount} more)` : ''}`
      : 'No direct dependencies';
  
    // Get file extension for syntax highlighting
    const extension = filePath.split('.').pop();
    
    // Build instruction prompt - this is now separated from the content
    const instruction = `
TRANSLATE THE FOLLOWING FILE: <span class="math-inline">\{filePath\} \(</span>{sourceFramework} -> ${targetFramework})
FILE TYPE: ${fileType.charAt(0).toUpperCase() + fileType.slice(1)}
SOURCE TECH: <span class="math-inline">\{fileAnalysis\.hasTypeScript ? 'TypeScript' \: 'JavaScript'\}</span>{fileAnalysis.hasHooks ? ', Hooks' : ''}${fileAnalysis.hasClasses ? ', Classes' : ''}
DEPENDENCIES HINT: ${depText}

TARGET FRAMEWORK: ${targetFramework}
TARGET LANGUAGE: ${targetOptions.typescript ? 'TypeScript' : 'JavaScript'}
TARGET STYLE: ${targetOptions.compositionApi ? 'Composition API/Hooks' : 'Traditional/Options API'}
TARGET STATE MGT: ${targetOptions.stateManagement || 'Native state management'}

INSTRUCTIONS:
1.  Translate the provided file content from ${sourceFramework} to ${targetFramework}.
2.  Ensure the entire file content is translated completely. Do not omit any part of the code.
3.  Adhere strictly to ${targetFramework} best practices and the target options specified above.
4.  Preserve original code comments unless they are no longer relevant.
5.  Handle all necessary imports for the ${targetFramework} code.
6.  The output MUST be the raw code for the translated file *only*. Do not add explanations, introductions, or markdown formatting like \`\`\`.
7.  Ensure the final output represents a fully functional and complete file for the target framework. Include a comment like "// END OF TRANSLATED FILE" at the very end.

Original File Extension: .${extension}
---
BEGIN CODE TRANSLATION FOR: ${filePath}
`;  
    // Return both instruction and content separately
    return {
      instruction,
      content: fileContent
    };
  }
  
  /**
   * Build an architecture recommendation prompt
   * @param {Object} config - Translation configuration
   * @returns {string} Architecture recommendation prompt
   */
  export function buildArchitecturePrompt(config) {
    const { 
      sourceFramework, 
      targetFramework, 
      sourceOptions = {}, 
      targetOptions = {} 
    } = config;
  
    return `
  ARCHITECTURE RECOMMENDATIONS: ${sourceFramework.toUpperCase()} TO ${targetFramework.toUpperCase()}
  
  SOURCE: ${sourceFramework} ${sourceOptions.version || 'latest'}
  TARGET: ${targetFramework} ${targetOptions.version || 'latest'}
  
  PROVIDE RECOMMENDATIONS FOR:
  1. Project Structure
  2. Performance Considerations
  3. State Management (${targetOptions.stateManagement || 'framework-native'})
  4. Routing Strategy
  5. TypeScript Integration (${targetOptions.typescript ? 'Required' : 'Optional'})
  6. Testing Approach
  7. Component Architecture
  
  CONSTRAINTS:
  - TypeScript: ${sourceOptions.typescript ? 'Currently used' : 'Not used'} → ${targetOptions.typescript ? 'Will be used' : 'Not needed'}
  - Component Style: ${targetOptions.compositionApi ? 'Composition API/Hooks preferred' : 'Traditional components'}
  
  Provide concise, actionable migration guidance.`;
  }
  
  // Export the functions
  export default {
    buildMasterPrompt,
    buildFilePrompt,
    buildArchitecturePrompt,
    analyzeFileContent
  };