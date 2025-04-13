/**
 * Utility functions for cleaning and de-duplicating LLM generated content
 */

/**
 * Detects and removes repeated blocks of code in a string
 * Uses a sliding window approach to find significant repetitions
 * 
 * @param {string} content - The content to clean up
 * @param {Object} options - Configuration options
 * @returns {string} - Cleaned content with repetitions removed
 */
export function removeRepeatedContent(content, options = {}) {
    if (!content) return content;
    
    const {
      minBlockSize = 100, // Minimum size of a block to consider for deduplication
      similarityThreshold = 0.9, // How similar blocks need to be to be considered duplicates
      maxDuplicates = 3, // Max allowed duplicates of the same content
      keepFirst = true, // Keep the first occurrence of duplicate blocks
    } = options;
    
    // First, check for simple exact duplicates of large blocks
    const blocks = findLargeRepeatedBlocks(content, minBlockSize);
    
    if (blocks.length === 0) {
      // No large repeated blocks found
      return content;
    }
    
    // Process duplicates starting with the largest blocks
    return removeRepeatedBlocks(content, blocks, maxDuplicates, keepFirst);
  }
  
  /**
   * Finds large repeated blocks in the content
   * @param {string} content - The content to analyze
   * @param {number} minBlockSize - Minimum block size to consider
   * @returns {Array} - Array of repeated block objects
   */
  function findLargeRepeatedBlocks(content, minBlockSize) {
    const blocks = [];
    const contentLength = content.length;
    
    // Find significant repeated blocks (at least minBlockSize characters)
    for (let blockSize = Math.min(500, contentLength / 3); blockSize >= minBlockSize; blockSize = Math.floor(blockSize * 0.8)) {
      const blockCounts = new Map();
      
      // Skip if the remaining content is too small
      if (contentLength < blockSize * 2) continue;
      
      // Slide a window of blockSize across the content
      for (let i = 0; i <= contentLength - blockSize; i += 25) { // Step by 25 for performance
        const block = content.substring(i, i + blockSize);
        
        // Skip blocks that are just whitespace or very low information
        if (isLowInformationBlock(block)) continue;
        
        // Track occurrences
        if (!blockCounts.has(block)) {
          blockCounts.set(block, []);
        }
        blockCounts.get(block).push(i);
      }
      
      // Add blocks that appear multiple times
      for (const [block, positions] of blockCounts.entries()) {
        if (positions.length > 1) {
          blocks.push({
            content: block,
            positions,
            size: block.length
          });
        }
      }
    }
    
    // Sort by size (largest first) and then by occurrence count
    return blocks.sort((a, b) => 
      b.size - a.size || b.positions.length - a.positions.length
    );
  }
  
  /**
   * Checks if a block has very low information content
   * @param {string} block - The block to check
   * @returns {boolean} - True if low information content
   */
  function isLowInformationBlock(block) {
    // Skip if more than 50% whitespace or empty
    const nonWhitespace = block.replace(/\s+/g, '').length;
    if (nonWhitespace < block.length * 0.5) return true;
    
    // Skip if it's just repeated characters
    const charCount = new Set(block).size;
    if (charCount < 10) return true;
    
    return false;
  }
  
  /**
   * Removes repeated blocks from content
   * @param {string} content - Original content
   * @param {Array} blocks - Array of block objects to remove
   * @param {number} maxDuplicates - Maximum allowed duplicates
   * @param {boolean} keepFirst - Whether to keep the first occurrence
   * @returns {string} - Content with repetitions removed
   */
  function removeRepeatedBlocks(content, blocks, maxDuplicates, keepFirst) {
    // Create a copy to modify
    let result = content;
    let wasModified = false;
    
    // Track positions that have been modified
    const modifiedPositions = new Set();
    
    // Process each block
    for (const block of blocks) {
      const { content: blockContent, positions } = block;
      
      // Skip if there aren't too many duplicates
      if (positions.length <= maxDuplicates) continue;
      
      // Get positions to remove (keeping the first if keepFirst is true)
      const positionsToRemove = keepFirst 
        ? positions.slice(maxDuplicates) 
        : positions.slice(0, positions.length - maxDuplicates);
      
      // Skip positions that overlap with already modified sections
      const validPositionsToRemove = positionsToRemove.filter(pos => {
        for (let i = pos; i < pos + blockContent.length; i++) {
          if (modifiedPositions.has(i)) return false;
        }
        return true;
      });
      
      if (validPositionsToRemove.length === 0) continue;
      
      // Start with the highest position first (to not affect earlier positions)
      validPositionsToRemove.sort((a, b) => b - a);
      
      for (const pos of validPositionsToRemove) {
        // Find the block with surrounding context
        const contextBefore = result.substring(Math.max(0, pos - 50), pos);
        const contextAfter = result.substring(pos + blockContent.length, 
          Math.min(result.length, pos + blockContent.length + 50));
        
        // Find sensible places to cut (prefer at newlines)
        const startCut = findBestSplitPosition(contextBefore, true);
        const endCut = findBestSplitPosition(contextAfter, false);
        
        const fullStartPos = pos - (contextBefore.length - startCut);
        const fullEndPos = pos + blockContent.length + endCut;
        
        // Mark these positions as modified
        for (let i = fullStartPos; i < fullEndPos; i++) {
          modifiedPositions.add(i);
        }
        
        // Remove the duplicate section
        result = result.substring(0, fullStartPos) + 
                 (keepFirst ? '/* Duplicate content removed */' : '') +
                 result.substring(fullEndPos);
        
        wasModified = true;
      }
    }
    
    // Add a comment at the end if modifications were made
    if (wasModified) {
      result += "\n// Content cleaned from LLM output repetitions";
    }
    
    return result;
  }
  
  /**
   * Finds the best position to split text
   * @param {string} text - The text to split
   * @param {boolean} fromEnd - Whether to search from the end
   * @returns {number} - The best position to split
   */
  function findBestSplitPosition(text, fromEnd) {
    if (!text) return 0;
    
    // Preferred split positions in order
    const preferredSplits = [
      /\n\s*\n/g, // Double newline
      /\n/g,      // Single newline
      /[.;{}]\s+/g, // End of statement or block
      /\s{2,}/g,  // Multiple spaces
    ];
    
    for (const splitPattern of preferredSplits) {
      const matches = [...text.matchAll(splitPattern)];
      
      if (matches.length > 0) {
        // Get the last or first match depending on fromEnd
        const match = fromEnd ? matches[matches.length - 1] : matches[0];
        return match.index + match[0].length;
      }
    }
    
    // Default: middle of the context
    return Math.floor(text.length / 2);
  }
  
  /**
   * Detects and handles common LLM completion patterns 
   * such as repeated instructions, markdown fences, etc.
   * 
   * @param {string} content - The content to clean up
   * @returns {string} - Cleaned content
   */
  export function cleanupLlmOutput(content) {
    if (!content) return content;
    
    let cleaned = content;
    
    // Remove markdown code blocks if there appears to be code outside of blocks
    // This helps with LLM's tendency to wrap code in markdown fences even when not needed
    if (content.includes('```') && content.replace(/```[\s\S]*?```/g, '').trim().length > 0) {
      cleaned = cleaned.replace(/```(?:jsx|js|javascript|typescript|tsx|vue|html)?\n([\s\S]*?)```/g, '$1');
    }
    
    // Remove repeated end of file indicators or common LLM trailing phrases
    const endIndicators = [
      'END OF TRANSLATED FILE',
      'END OF FILE',
      'That completes the translation',
      'I hope this translation'
    ];
    
    for (const indicator of endIndicators) {
      const regex = new RegExp(`// ?${indicator}.*$`, 'gm');
      const matches = [...cleaned.matchAll(regex)];
      
      // Keep only the first occurrence
      if (matches.length > 1) {
        for (let i = 1; i < matches.length; i++) {
          const match = matches[i];
          cleaned = cleaned.substring(0, match.index) + cleaned.substring(match.index + match[0].length);
        }
      }
    }
    
    // Remove common LLM completion patterns like repetitive explanations or headers
    const patternIndicators = [
      'Here is the translated',
      'This is the Vue version',
      'This is the React version',
      'I have converted the',
      'I have converted the,',
      'I have translated the',
      'I have translated the',
    ];
    
    for (const phrase of patternIndicators) {
      if (cleaned.includes(phrase)) {
        // Extract everything starting from these phrases to the next code statement
        const regex = new RegExp(`${phrase}[\\s\\S]*?(?=import|const|let|var|function|class|export|<|//|\/\\*|$)`, 'g');
        cleaned = cleaned.replace(regex, '');
      }
    }
    
    // Clean up any remaining markdown elements
    cleaned = cleaned.replace(/^\s*#.*$/gm, ''); // Remove markdown headers
    
    return cleaned.trim();
  }
  
  /**
   * Complete content cleanup pipeline
   * @param {string} content - Original content from LLM
   * @returns {string} - Cleaned content
   */
  export function cleanContent(content) {
    if (!content) return content;
    
    // First, remove common LLM patterns
    let cleaned = cleanupLlmOutput(content);
    
    // Then remove repeated blocks
    cleaned = removeRepeatedContent(cleaned);
    
    return cleaned;
  }