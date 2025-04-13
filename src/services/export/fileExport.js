/**
 * File Export Service
 * Provides methods for exporting files and file collections
 */

/**
 * Dynamically import JSZip to keep the bundle size smaller
 * @returns {Promise<JSZip>} Imported JSZip library
 */
async function importJSZip() {
    try {
      const JSZip = await import('jszip');
      return JSZip.default || JSZip;
    } catch (error) {
      console.error('Failed to import JSZip:', error);
      throw new Error('JSZip library is required for file export');
    }
  }
  
  /**
   * Export a single file
   * @param {string} content - File content
   * @param {string} filename - Desired filename
   * @param {string} [mimeType='text/plain'] - MIME type of the file
   */
  export function exportFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }
  
  /**
   * Export multiple files as a ZIP archive
   * @param {Object} files - Object with filename as key and content as value
   * @param {string} [zipName='exported-files.zip'] - Name of the ZIP file
   * @returns {Promise<void>}
   */
  export async function exportFilesAsZip(files, zipName = 'exported-files.zip') {
    try {
      const JSZip = await importJSZip();
      const zip = new JSZip();
      
      // Add files to ZIP
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });
      
      // Generate ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ZIP export failed:', error);
      throw error;
    }
  }
  
  /**
   * Export files with optional filtering
   * @param {Object} files - Object with filename as key and content as value
   * @param {string[]} [fileExtensions] - Optional array of file extensions to filter
   * @returns {Promise<void>}
   */
  export async function exportFilteredFiles(files, fileExtensions) {
    let filteredFiles = files;
    
    if (fileExtensions && fileExtensions.length) {
      filteredFiles = Object.fromEntries(
        Object.entries(files).filter(([filename]) => 
          fileExtensions.some(ext => filename.endsWith(ext))
        )
      );
    }
    
    await exportFilesAsZip(filteredFiles);
  }