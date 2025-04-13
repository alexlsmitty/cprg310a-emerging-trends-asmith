// services/parser/repoAnalyzer.js
/**
 * Service for analyzing repository structure and dependencies
 */

/**
 * Analyzes imports and dependencies between files
 * @param {Array} files - Flattened array of file objects with content
 * @returns {Object} - Dependency graph and import information
 */
export const analyzeDependencies = (files) => {
    const dependencyGraph = {};
    const importMap = {};
    
    // First pass: collect all exports
    for (const file of files) {
      if (!file.content) continue;
      
      const filePath = file.path;
      dependencyGraph[filePath] = {
        imports: [],
        importedBy: []
      };
      
      // Extract exports from this file
      const exports = extractExports(file.content, file.language);
      
      if (exports.length > 0) {
        for (const exportItem of exports) {
          const key = `${exportItem.name}`;
          importMap[key] = importMap[key] || [];
          importMap[key].push({
            filePath,
            exportType: exportItem.type
          });
        }
      }
    }
    
    // Second pass: resolve imports and build dependency graph
    for (const file of files) {
      if (!file.content) continue;
      
      const filePath = file.path;
      const imports = extractImports(file.content, file.language);
      
      for (const importItem of imports) {
        // Try to resolve the import to a file in our codebase
        const resolvedFile = resolveImport(importItem.source, filePath, files);
        
        if (resolvedFile) {
          // Add to dependency graph
          dependencyGraph[filePath].imports.push(resolvedFile);
          dependencyGraph[resolvedFile].importedBy.push(filePath);
        }
      }
    }
    
    return {
      dependencyGraph,
      importMap
    };
  };
  
  /**
   * Extract exports from file content
   * @param {string} content - File content
   * @param {string} language - Language type
   * @returns {Array} - Array of export objects
   */
  const extractExports = (content, language) => {
    const exports = [];
    
    if (['javascript', 'typescript', 'jsx', 'tsx'].includes(language)) {
      // Match named exports: export const/function/class Name
      const namedExportRegex = /export\s+(const|let|var|function|class)\s+([a-zA-Z0-9_$]+)/g;
      let match;
      
      while ((match = namedExportRegex.exec(content)) !== null) {
        exports.push({
          type: match[1], // const, function, class
          name: match[2],
          isDefault: false
        });
      }
      
      // Match default exports: export default Name
      const defaultExportRegex = /export\s+default\s+([a-zA-Z0-9_$]+)/g;
      while ((match = defaultExportRegex.exec(content)) !== null) {
        exports.push({
          type: 'default',
          name: match[1],
          isDefault: true
        });
      }
    } else if (language === 'vue') {
      // For Vue SFC, consider the component name or file name as an export
      const componentNameRegex = /name:\s*['"]([a-zA-Z0-9_$]+)['"]/;
      const match = componentNameRegex.exec(content);
      
      if (match) {
        exports.push({
          type: 'component',
          name: match[1],
          isDefault: true
        });
      }
    }
    
    return exports;
  };
  
  /**
   * Extract imports from file content
   * @param {string} content - File content
   * @param {string} language - Language type
   * @returns {Array} - Array of import objects
   */
  const extractImports = (content, language) => {
    const imports = [];
    
    if (['javascript', 'typescript', 'jsx', 'tsx', 'vue'].includes(language)) {
      // Match ES6 imports: import X from 'Y'
      const importRegex = /import\s+(?:{([^}]+)}|([a-zA-Z0-9_$]+))\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const namedImports = match[1] ? match[1].split(',').map(s => s.trim()) : [];
        const defaultImport = match[2];
        const source = match[3];
        
        imports.push({
          source,
          namedImports,
          defaultImport
        });
      }
    }
    
    return imports;
  };
  
  /**
   * Resolve an import to a file path
   * @param {string} importSource - Import source string
   * @param {string} currentFilePath - Path of the file containing the import
   * @param {Array} files - All files in the project
   * @returns {string|null} - Resolved file path or null if not found
   */
  const resolveImport = (importSource, currentFilePath, files) => {
    // Handle relative imports
    if (importSource.startsWith('./') || importSource.startsWith('../')) {
      const currentDir = currentFilePath.split('/').slice(0, -1).join('/');
      let resolvedPath = normalizePath(`${currentDir}/${importSource}`);
      
      // Try exact match first
      const exactMatch = files.find(f => f.path === resolvedPath);
      if (exactMatch) return exactMatch.path;
      
      // Try with extensions
      for (const ext of ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']) {
        const withExt = `${resolvedPath}${ext}`;
        const fileWithExt = files.find(f => f.path === withExt);
        if (fileWithExt) return fileWithExt.path;
      }
      
      // Try as directory with index file
      for (const ext of ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']) {
        const indexFile = `${resolvedPath}/index${ext}`;
        const fileWithIndex = files.find(f => f.path === indexFile);
        if (fileWithIndex) return fileWithIndex.path;
      }
    } else {
      // For non-relative imports (node_modules or aliases), we can't resolve them directly
      // We'd need project config like webpack aliases or tsconfig paths to resolve these
      // For now, just return null
      return null;
    }
    
    return null;
  };
  
  /**
   * Normalize a file path (resolve ../ and ./)
   * @param {string} path - File path to normalize
   * @returns {string} - Normalized path
   */
  const normalizePath = (path) => {
    const parts = path.split('/');
    const result = [];
    
    for (const part of parts) {
      if (part === '..') {
        result.pop();
      } else if (part !== '.' && part !== '') {
        result.push(part);
      }
    }
    
    return result.join('/');
  };
  
  /**
   * Create a consolidated representation of the repository
   * @param {Object} fileTree - The parsed file tree
   * @param {Object} analysis - The project analysis results
   * @returns {string} - Consolidated repository text
   */
  export const createRepoRepresentation = (fileTree, analysis) => {
    let output = "This file is a merged representation of the entire codebase, combined into a single document.\n\n";
    
    // Add repository info
    output += "================================================================\n";
    output += "Repository Information\n";
    output += "================================================================\n\n";
    
    output += `Detected Frameworks: ${analysis.detectedFrameworks.join(', ')}\n`;
    output += `Total Files: ${analysis.totalFiles}\n`;
    output += `Component Count: ${analysis.componentCount}\n\n`;
    
    // Add dependencies section if available
    if (Object.keys(analysis.dependencies).length > 0) {
      output += "Dependencies:\n";
      for (const [dep, version] of Object.entries(analysis.dependencies)) {
        output += `  ${dep}: ${version}\n`;
      }
      output += "\n";
    }
    
    // Add file structure
    output += "================================================================\n";
    output += "Directory Structure\n";
    output += "================================================================\n";
    
    const printStructure = (node, indent = '') => {
      if (node.type === 'file') {
        output += `${indent}${node.name}\n`;
      } else if (node.type === 'directory') {
        if (node.name !== 'root') {
          output += `${indent}${node.name}/\n`;
          indent += '  ';
        }
        
        if (node.children) {
          node.children.forEach(child => {
            printStructure(child, indent);
          });
        }
      }
    };
    
    printStructure(fileTree);
    output += "\n";
    
    // Add each file's content
    output += "================================================================\n";
    output += "Files\n";
    output += "================================================================\n\n";
    
    const addFileContent = (node) => {
      if (node.type === 'file') {
        output += `================\n`;
        output += `File: ${node.path}\n`;
        output += `================\n`;
        output += `${node.content}\n\n`;
      } else if (node.type === 'directory' && node.children) {
        node.children.forEach(child => {
          addFileContent(child);
        });
      }
    };
    
    addFileContent(fileTree);
    
    output += "================================================================\n";
    output += "End of Repository\n";
    output += "================================================================\n";
    
    return output;
  };