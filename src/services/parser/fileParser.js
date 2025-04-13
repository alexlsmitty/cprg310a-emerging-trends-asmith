// services/parser/fileParser.js
/**
 * Service for parsing uploaded files and creating a file tree structure
 */

/**
 * Reads a file and returns its contents as text
 * @param {File} file - The file object to read
 * @returns {Promise<string>} - The file contents
 */
export const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };
  
  /**
   * Parses files into a tree structure based on path/name
   * @param {File[]} files - Array of uploaded files
   * @returns {Promise<Object>} - File tree with content and metadata
   */
  export const parseFilesToTree = async (files) => {
    console.log('Parsing files to tree:', files);
    
    const fileTree = {
      name: 'root',
      type: 'directory',
      children: [],
      path: ''
    };
    
    for (const file of files) {
      try {
        console.log('Processing file:', file.name);
        
        // Skip any problematic files
        if (!file.name || file.size === 0) {
          console.warn('Skipping invalid file:', file);
          continue;
        }
        
        const content = await readFileAsText(file);
        console.log(`Read content for ${file.name}, size: ${content.length}`);
        
        const fileObj = {
          name: file.name,
          type: 'file',
          content,
          size: file.size,
          lastModified: file.lastModified,
          extension: file.name.split('.').pop().toLowerCase(),
          path: file.webkitRelativePath || file.name, // Use relative path if available
          parsedContent: null
        };
  
        // Add language type based on extension
        fileObj.language = getLanguageByExtension(fileObj.extension);
        
        // Add to tree in the correct location
        addFileToTree(fileTree, fileObj);
      } catch (error) {
        console.error(`Error parsing file ${file.name}:`, error);
      }
    }
    
    console.log('Final file tree:', fileTree);
    return fileTree;
  };
  
  /**
   * Adds a file to the correct position in the file tree
   * @param {Object} tree - The file tree
   * @param {Object} fileObj - The file object to add
   */
  const addFileToTree = (tree, fileObj) => {
    const pathParts = fileObj.path.split('/');
    const fileName = pathParts.pop(); // Last item is file name
    
    let currentNode = tree;
    
    // Create directories as needed
    if (pathParts.length > 0 && pathParts[0] !== '') {
      for (const part of pathParts) {
        // Check if directory already exists
        let found = false;
        for (const child of currentNode.children) {
          if (child.name === part && child.type === 'directory') {
            currentNode = child;
            found = true;
            break;
          }
        }
        
        // Create new directory if not found
        if (!found) {
          const newDir = {
            name: part,
            type: 'directory',
            children: [],
            path: currentNode.path ? `${currentNode.path}/${part}` : part
          };
          currentNode.children.push(newDir);
          currentNode = newDir;
        }
      }
    }
    
    // Add file to current directory
    fileObj.name = fileName;
    fileObj.path = currentNode.path ? `${currentNode.path}/${fileName}` : fileName;
    currentNode.children.push(fileObj);
  };
  
  /**
   * Get the programming language based on file extension
   * @param {string} extension - The file extension
   * @returns {string} - The programming language
   */
  const getLanguageByExtension = (extension) => {
    const extensionMap = {
      // JavaScript
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      
      // Vue
      'vue': 'vue',
      
      // React/JSX
      'jsx': 'jsx',
      'tsx': 'tsx',
      
      // Svelte
      'svelte': 'svelte',
      
      // Angular
      'component.ts': 'typescript',
      'module.ts': 'typescript',
      'service.ts': 'typescript',
      
      // Styling
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      
      // HTML
      'html': 'html',
      
      // Config
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      
      // Default
      'md': 'markdown',
      'txt': 'text'
    };
    
    return extensionMap[extension] || 'text';
  };
  
  /**
   * Analyzes files to detect frameworks and key dependencies
   * @param {Object} fileTree - The file tree to analyze
   * @returns {Object} - Analysis results with detected frameworks and dependencies
   */
  export const analyzeProject = (fileTree) => {
    const analysis = {
      detectedFrameworks: [],
      dependencies: {},
      fileTypes: {},
      componentCount: 0,
      totalFiles: 0
    };
    
    // Traverse the file tree and analyze
    const traverseAndAnalyze = (node) => {
      if (node.type === 'file') {
        analysis.totalFiles++;
        
        // Count file types
        if (!analysis.fileTypes[node.language]) {
          analysis.fileTypes[node.language] = 0;
        }
        analysis.fileTypes[node.language]++;
        
        // Detect frameworks and components
        detectFrameworks(node, analysis);
      } else if (node.type === 'directory' && node.children) {
        for (const child of node.children) {
          traverseAndAnalyze(child);
        }
      }
    };
    
    traverseAndAnalyze(fileTree);
    
    return analysis;
  };
  
  /**
   * Detects frameworks and components in a file
   * @param {Object} file - The file object
   * @param {Object} analysis - The analysis object to update
   */
  const detectFrameworks = (file, analysis) => {
    const { content, extension, name } = file;
    
    // React detection
    if ((extension === 'jsx' || extension === 'tsx') || 
        (content && (content.includes('import React') || content.includes('from "react"') || content.includes("from 'react'")))) {
      if (!analysis.detectedFrameworks.includes('react')) {
        analysis.detectedFrameworks.push('react');
      }
      
      // Count React components
      if (content && (content.includes('class') && content.includes('extends React.Component') || 
          content.includes('extends Component') || 
          content.includes('function') && content.includes('return') && content.includes('JSX'))) {
        analysis.componentCount++;
      }
    }
    
    // Vue detection
    if (extension === 'vue' || 
        (content && (content.includes('<template>') || content.includes('createApp') || content.includes('Vue.createApp')))) {
      if (!analysis.detectedFrameworks.includes('vue')) {
        analysis.detectedFrameworks.push('vue');
      }
      
      // Count Vue components
      if (extension === 'vue' || (content && content.includes('defineComponent'))) {
        analysis.componentCount++;
      }
    }
    
    // Angular detection
    if ((extension === 'ts' && (name.includes('.component.') || name.includes('.service.'))) || 
        (content && (content.includes('@Component') || content.includes('@NgModule')))) {
      if (!analysis.detectedFrameworks.includes('angular')) {
        analysis.detectedFrameworks.push('angular');
      }
      
      // Count Angular components
      if (name.includes('.component.') || (content && content.includes('@Component'))) {
        analysis.componentCount++;
      }
    }
    
    // Svelte detection
    if (extension === 'svelte' || 
        (content && content.includes('<script>') && content.includes('<style>') && !content.includes('<template>'))) {
      if (!analysis.detectedFrameworks.includes('svelte')) {
        analysis.detectedFrameworks.push('svelte');
      }
      
      // Count Svelte components
      if (extension === 'svelte') {
        analysis.componentCount++;
      }
    }
    
    // Dependency detection
    if (name === 'package.json' && content) {
      try {
        const packageJson = JSON.parse(content);
        if (packageJson.dependencies) {
          analysis.dependencies = { ...analysis.dependencies, ...packageJson.dependencies };
        }
        if (packageJson.devDependencies) {
          analysis.dependencies = { ...analysis.dependencies, ...packageJson.devDependencies };
        }
      } catch (e) {
        console.error('Error parsing package.json:', e);
      }
    }
  };
  
  /**
   * Flattens a file tree into an array of file objects
   * @param {Object} fileTree - The file tree to flatten
   * @returns {Array} - Array of file objects
   */
  export const flattenFileTree = (fileTree) => {
    const files = [];
    
    const traverse = (node) => {
      if (node.type === 'file') {
        files.push(node);
      } else if (node.type === 'directory' && node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };
    
    traverse(fileTree);
    
    return files;
  };