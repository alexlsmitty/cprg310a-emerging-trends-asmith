<template>
    <div class="animation-container">
      <div class="analysis-visualization">
        <!-- Code document with scanning effect -->
        <div class="code-document" :class="{ 'scanning': isScanning, 'analyzed': isAnalyzed }">
          <!-- Code lines representation -->
          <div class="code-content">
            <div v-for="(line, index) in codeLines" :key="`line-${index}`" 
                 class="code-line"
                 :class="{ 
                   'highlight': highlightedLines.includes(index),
                   'structure': analyzedElements.structure.includes(index),
                   'logic': analyzedElements.logic.includes(index),
                   'pattern': analyzedElements.pattern.includes(index)
                 }">
              <span class="line-number">{{ index + 1 }}</span>
              <span class="line-content" v-html="formatCodeLine(line, index)"></span>
            </div>
          </div>
          
          <!-- Scan line effect -->
          <div class="scan-line" :style="{ top: `${scanLinePosition}%` }"></div>
          
          <!-- Network connections -->
          <svg class="connections-overlay" :class="{ 'active': isAnalyzed }">
            <g v-for="(connection, index) in connections" :key="`connection-${index}`">
              <path :d="connection.path" class="connection-path" 
                    :class="`connection-${connection.type}`"
                    :style="{ 
                      animationDelay: `${index * 0.2}s`, 
                      strokeDasharray: connection.length,
                      strokeDashoffset: isAnalyzed ? '0' : connection.length
                    }"></path>
            </g>
          </svg>
          
          <!-- Analysis elements that appear after scanning -->
          <div class="analysis-elements" :class="{ 'active': isAnalyzed }">
            <div v-for="(element, index) in analysisElements" :key="`element-${index}`"
                 class="analysis-element"
                 :class="`element-${element.type}`"
                 :style="{ 
                   top: `${element.position.y}%`, 
                   left: `${element.position.x}%`,
                   animationDelay: `${0.5 + index * 0.15}s`
                 }">
              <div class="element-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="element.type === 'component'" d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path>
                  <path v-if="element.type === 'dependency'" d="m18 16 4-4-4-4"></path>
                  <path v-if="element.type === 'dependency'" d="m6 8-4 4 4 4"></path>
                  <path v-if="element.type === 'dependency'" d="M2 12h20"></path>
                  <path v-if="element.type === 'pattern'" d="M2 9a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9Z"></path>
                </svg>
              </div>
              <span class="element-label">{{ element.label }}</span>
            </div>
          </div>
        </div>
        
        <!-- Grid underlay for tech aesthetic -->
        <div class="grid-underlay"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
  
  // Sample code representation
  const codeLines = [
    "import React from 'react';",
    "import { useState, useEffect } from 'react';",
    "import Header from './components/Header';",
    "",
    "function App() {",
    "  const [data, setData] = useState(null);",
    "  ",
    "  useEffect(() => {",
    "    // Fetch data when component mounts",
    "    fetchData().then(result => {",
    "      setData(result);",
    "    });",
    "  }, []);",
    "",
    "  return (",
    "    <div className=\"app\">",
    "      <Header title=\"My React App\" />",
    "      {data ? (",
    "        <main>",
    "          <h1>{data.title}</h1>",
    "          <p>{data.description}</p>",
    "        </main>",
    "      ) : (",
    "        <p>Loading...</p>",
    "      )}",
    "    </div>",
    "  );",
    "}",
    "",
    "export default App;"
  ];
  
  // Animation state
  const isScanning = ref(false);
  const isAnalyzed = ref(false);
  const scanLinePosition = ref(0);
  const highlightedLines = ref([]);
  
  // Analysis categorization
  const analyzedElements = reactive({
    structure: [0, 1, 2, 4, 13, 14, 15, 28, 30], // Structural elements
    logic: [5, 7, 8, 9, 10, 11], // Logic elements
    pattern: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26] // Framework patterns
  });
  
  // Network connection paths
  const connections = [
    { 
      path: "M50,30 C150,50 100,150 200,170", 
      type: "structure",
      length: "300"
    },
    { 
      path: "M100,50 C180,60 150,100 230,120", 
      type: "logic",
      length: "250"
    },
    { 
      path: "M70,80 C100,120 170,150 220,190", 
      type: "pattern",
      length: "280"
    },
    { 
      path: "M40,100 C80,140 120,130 180,160", 
      type: "dependency",
      length: "230"
    },
    { 
      path: "M120,40 C160,90 140,130 180,180", 
      type: "structure",
      length: "260"
    },
    { 
      path: "M80,60 C120,90 160,110 200,140", 
      type: "logic",
      length: "240"
    },
    { 
      path: "M60,120 C90,140 130,170 160,200", 
      type: "pattern",
      length: "220"
    }
  ];
  
  // Analysis elements that appear after scanning
  const analysisElements = [
    { 
      type: 'component', 
      label: 'App Component',
      position: { x: 75, y: 30 } 
    },
    { 
      type: 'component', 
      label: 'Header Component',
      position: { x: 25, y: 45 } 
    },
    { 
      type: 'dependency', 
      label: 'React Import',
      position: { x: 20, y: 15 } 
    },
    { 
      type: 'dependency', 
      label: 'useState Hook',
      position: { x: 70, y: 65 } 
    },
    { 
      type: 'pattern', 
      label: 'JSX Pattern',
      position: { x: 80, y: 80 } 
    },
    { 
      type: 'pattern', 
      label: 'Conditional Rendering',
      position: { x: 25, y: 75 } 
    }
  ];
  
  // Syntax highlighting for code
  function formatCodeLine(line, index) {
    return line
      .replace(/(['"])(.*?)\1/g, '<span class="code-string">$&</span>') // Strings
      .replace(/\b(import|from|function|const|return|export|default)\b/g, '<span class="code-keyword">$&</span>') // Keywords
      .replace(/\b(useState|useEffect|React|Header|App)\b/g, '<span class="code-function">$&</span>') // Functions
      .replace(/\b(className)\b/g, '<span class="code-attr">$&</span>') // Attributes
      .replace(/(&lt;\/?\w+(&gt;|[\s\w="-{}]*)&gt;?)/g, '<span class="code-tag">$&</span>') // JSX tags
      .replace(/\{([^{}]*)\}/g, '<span class="code-expression">{$1}</span>'); // JSX expressions
  }
  
  // Animation sequence
  function runAnimation() {
    let timers = [];
    
    // Reset animation state
    isScanning.value = false;
    isAnalyzed.value = false;
    scanLinePosition.value = 0;
    highlightedLines.value = [];
    
    // Step 1: Start scanning
    timers.push(setTimeout(() => {
      isScanning.value = true;
      
      // Animate scan line
      let scanProgress = 0;
      const scanInterval = setInterval(() => {
        scanProgress += 1;
        scanLinePosition.value = scanProgress;
        
        // Highlight lines as we scan
        if (scanProgress % 4 === 0 && highlightedLines.value.length < codeLines.length) {
          highlightedLines.value.push(highlightedLines.value.length);
        }
        
        if (scanProgress >= 100) {
          clearInterval(scanInterval);
          
          // Step 2: Show analysis
          timers.push(setTimeout(() => {
            isAnalyzed.value = true;
            
            // Step 3: Reset and loop after delay
            timers.push(setTimeout(() => {
              runAnimation();
            }, 6000));
          }, 500));
        }
      }, 50);
      
      timers.push(() => clearInterval(scanInterval));
    }, 1000));
    
    // Return cleanup function
    return () => {
      timers.forEach(timer => {
        if (typeof timer === 'function') {
          timer();
        } else {
          clearTimeout(timer);
        }
      });
    };
  }
  
  // Start animation when component mounts
  let cleanupAnimation;
  onMounted(() => {
    cleanupAnimation = runAnimation();
  });
  
  // Clean up on unmount
  onBeforeUnmount(() => {
    if (cleanupAnimation) cleanupAnimation();
  });
  </script>
  
  <style scoped>
  .animation-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
  }
  
  .analysis-visualization {
    width: 100%;
    max-width: 600px;
    height: 300px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* Grid background */
  .grid-underlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(rgba(71, 118, 230, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(71, 118, 230, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    z-index: -1;
    opacity: 0.5;
  }
  
  /* Code document styling */
  .code-document {
    width: 90%;
    height: 90%;
    background-color: rgba(30, 41, 59, 0.7);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    transition: all 0.5s ease;
    border: 1px solid rgba(71, 118, 230, 0.2);
  }
  
  .code-document.scanning {
    box-shadow: 0 0 20px rgba(71, 118, 230, 0.3);
    border-color: rgba(71, 118, 230, 0.4);
  }
  
  .code-document.analyzed {
    background-color: rgba(30, 41, 59, 0.5);
    border-color: rgba(71, 118, 230, 0.6);
  }
  
  /* Code content */
  .code-content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.7rem;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.7);
    padding: 1rem;
  }
  
  .code-line {
    display: flex;
    margin-bottom: 0.3rem;
    transition: all 0.3s ease;
    opacity: 0.7;
  }
  
  .line-number {
    display: inline-block;
    color: rgba(255, 255, 255, 0.3);
    min-width: 30px;
    user-select: none;
  }
  
  .line-content {
    flex: 1;
  }
  
  /* Highlighted code lines */
  .code-line.highlight {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .code-line.structure {
    border-left: 2px solid rgba(71, 118, 230, 0.7);
    padding-left: 0.5rem;
    background-color: rgba(71, 118, 230, 0.05);
  }
  
  .code-line.logic {
    border-left: 2px solid rgba(80, 250, 123, 0.7);
    padding-left: 0.5rem;
    background-color: rgba(80, 250, 123, 0.05);
  }
  
  .code-line.pattern {
    border-left: 2px solid rgba(189, 147, 249, 0.7);
    padding-left: 0.5rem;
    background-color: rgba(189, 147, 249, 0.05);
  }
  
  /* Code syntax highlighting */
  .code-string {
    color: #f1fa8c;
  }
  
  .code-keyword {
    color: #ff79c6;
  }
  
  .code-function {
    color: #8be9fd;
  }
  
  .code-tag {
    color: #ff79c6;
  }
  
  .code-attr {
    color: #50fa7b;
  }
  
  .code-expression {
    color: #f1fa8c;
  }
  
  /* Scanning effect */
  .scan-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, 
      rgba(71, 118, 230, 0) 0%, 
      rgba(71, 118, 230, 0.8) 50%, 
      rgba(71, 118, 230, 0) 100%);
    box-shadow: 0 0 10px rgba(71, 118, 230, 0.8);
    z-index: 5;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .scanning .scan-line {
    opacity: 1;
  }
  
  /* Network connections */
  .connections-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transition: opacity 1s ease;
  }
  
  .connections-overlay.active {
    opacity: 1;
  }
  
  .connection-path {
    fill: none;
    stroke-width: 1.5;
    opacity: 0.6;
    transition: stroke-dashoffset 1.5s ease;
  }
  
  .connection-structure {
    stroke: rgba(71, 118, 230, 0.8);
    filter: drop-shadow(0 0 2px rgba(71, 118, 230, 0.8));
  }
  
  .connection-logic {
    stroke: rgba(80, 250, 123, 0.8);
    filter: drop-shadow(0 0 2px rgba(80, 250, 123, 0.8));
  }
  
  .connection-pattern {
    stroke: rgba(189, 147, 249, 0.8);
    filter: drop-shadow(0 0 2px rgba(189, 147, 249, 0.8));
  }
  
  .connection-dependency {
    stroke: rgba(255, 184, 108, 0.8);
    filter: drop-shadow(0 0 2px rgba(255, 184, 108, 0.8));
  }
  
  /* Analysis elements */
  .analysis-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 20;
  }
  
  .analysis-element {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.7rem;
    border-radius: 20px;
    background-color: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(4px);
    transform: scale(0);
    opacity: 0;
    transition: transform 0.5s ease, opacity 0.5s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .analysis-elements.active .analysis-element {
    transform: scale(1);
    opacity: 1;
    animation: pulse 3s infinite;
  }
  
  .element-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .element-label {
    font-size: 0.7rem;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .element-component {
    border: 1px solid rgba(71, 118, 230, 0.6);
    color: rgba(71, 118, 230, 1);
  }
  
  .element-dependency {
    border: 1px solid rgba(255, 184, 108, 0.6);
    color: rgba(255, 184, 108, 1);
  }
  
  .element-pattern {
    border: 1px solid rgba(189, 147, 249, 0.6);
    color: rgba(189, 147, 249, 1);
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  </style>