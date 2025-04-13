<template>
  <div class="code-transform-container">
    <div class="code-panels">
      <div class="code-panel source-panel">
        <div class="panel-header">
          <div class="file-tab">
            <span class="file-name">App.jsx</span>
          </div>
          <div class="window-controls">
            <span class="control"></span>
            <span class="control"></span>
            <span class="control"></span>
          </div>
        </div>
        <div class="editor-content">
          <div class="line-numbers">
            <div v-for="n in 20" :key="`source-line-${n}`" class="line-number">{{ n }}</div>
          </div>
          <div class="code-content" ref="sourceCode">
            <div v-for="(line, index) in sourceCodeLines" :key="`source-${index}`" 
                 class="code-line" 
                 :class="{ 'visible': visibleSourceLines > index }">
              <span v-html="formatCode(line)"></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="transform-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
      
      <div class="code-panel target-panel">
        <div class="panel-header">
          <div class="file-tab">
            <span class="file-name">App.vue</span>
          </div>
          <div class="window-controls">
            <span class="control"></span>
            <span class="control"></span>
            <span class="control"></span>
          </div>
        </div>
        <div class="editor-content">
          <div class="line-numbers">
            <div v-for="n in 25" :key="`target-line-${n}`" class="line-number">{{ n }}</div>
          </div>
          <div class="code-content" ref="targetCode">
            <div v-for="(line, index) in targetCodeLines" :key="`target-${index}`" 
                 class="code-line" 
                 :class="{ 'visible': visibleTargetLines > index }">
              <span v-if="index === currentTypingLine" v-html="formatCode(line.substring(0, typedCharCount))"></span>
              <span v-if="index === currentTypingLine && typedCharCount > 0" class="cursor">|</span>
              <span v-if="index !== currentTypingLine && index < currentTypingLine" v-html="formatCode(line)"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="transformation-status">
      <div class="status-indicator" :class="{ 'active': isTransforming }">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
        </svg>
        <span>{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// State variables
const sourceCode = ref(null)
const targetCode = ref(null)
const visibleSourceLines = ref(0)
const visibleTargetLines = ref(0)
const currentTypingLine = ref(-1)
const typedCharCount = ref(0)
const isTransforming = ref(false)
const statusText = ref('Ready to transform')

// Sample code for demonstration
const sourceCodeLines = [
  "import React, { useState } from 'react';",
  "",
  "function Counter() {",
  "  const [count, setCount] = useState(0);",
  "",
  "  const increment = () => {",
  "    setCount(prevCount => prevCount + 1);",
  "  };",
  "",
  "  return (",
  "    &lt;div className=\"counter-container\"&gt;",
  "      &lt;h2&gt;React Counter&lt;/h2&gt;",
  "      &lt;div className=\"counter-display\"&gt;",
  "        &lt;p&gt;Current count: &lt;span&gt;{count}&lt;/span&gt;&lt;/p&gt;",
  "      &lt;/div&gt;",
  "      &lt;button className=\"btn-increment\" onClick={increment}&gt;",
  "        Increment",
  "      &lt;/button&gt;",
  "    &lt;/div&gt;",
  "  );",
  "}",
  "",
  "export default Counter;"
]

const targetCodeLines = [
  "&lt;template&gt;",
  "  &lt;div class=\"counter-container\"&gt;",
  "    &lt;h2&gt;Vue Counter&lt;/h2&gt;",
  "    &lt;div class=\"counter-display\"&gt;",
  "      &lt;p&gt;Current count: &lt;span&gt;{{ count }}&lt;/span&gt;&lt;/p&gt;",
  "    &lt;/div&gt;",
  "    &lt;button class=\"btn-increment\" @click=\"increment\"&gt;",
  "      Increment",
  "    &lt;/button&gt;",
  "  &lt;/div&gt;",
  "&lt;/template&gt;",
  "",
  "&lt;script setup&gt;",
  "import { ref } from 'vue'",
  "",
  "const count = ref(0)",
  "",
  "function increment() {",
  "  count.value++",
  "}",
  "&lt;/script&gt;",
  "",
  "&lt;style scoped&gt;",
  ".counter-container {",
  "  display: flex;",
  "  flex-direction: column;",
  "  align-items: center;",
  "  padding: 1.5rem;",
  "}",
  "",
  ".counter-display {",
  "  margin: 1rem 0;",
  "}",
  "",
  ".btn-increment {",
  "  padding: 0.5rem 1rem;",
  "  background-color: #4776E6;",
  "  color: white;",
  "  border: none;",
  "  border-radius: 4px;",
  "  cursor: pointer;",
  "}",
  "&lt;/style&gt;"
]

// Animation timing variables
let sourceLineInterval
let targetLineInterval
let typingInterval
let animationTimeout

// Utility function to format code with simple syntax highlighting
function formatCode(code) {
  // Replace some common syntax elements with colorized spans
  return code
    .replace(/(['"])(.*?)\1/g, '<span class="code-string">$&</span>') // Strings
    .replace(/\b(const|let|var|function|return|import|export|from|default|class|if|else|for|while)\b/g, '<span class="code-keyword">$&</span>') // Keywords
    .replace(/\b(useState|ref|prevCount|count|setCount|increment)\b/g, '<span class="code-function">$&</span>') // Functions & variables
    .replace(/\b(className|class|onClick|@click)\b/g, '<span class="code-attr">$&</span>') // Attributes
    .replace(/(&lt;\/?template&gt;|&lt;\/?script.*?&gt;|&lt;\/?style.*?&gt;)/g, '<span class="code-tag">$&</span>') // Vue specific tags
    .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*&gt;)/g, '<span class="code-element">$&</span>') // HTML elements
    .replace(/(&lt;\/?\w+)/g, '<span class="code-element">$&</span>') // Opening tags
    .replace(/(@\w+)/g, '<span class="code-directive">$&</span>') // Vue directives
    .replace(/({{.*?}})/g, '<span class="code-interpolation">$&</span>') // Interpolation
    .replace(/(&lt;span&gt;|&lt;\/span&gt;)/g, '<span class="code-element">$&</span>') // span tags
    .replace(/\b(\.[\w-]+)\b/g, '<span class="code-class">$&</span>') // CSS classes
    .replace(/\b(padding|margin|display|flex-direction|align-items|background-color|color|border|border-radius|cursor)\b:/g, '<span class="code-property">$&</span>') // CSS properties}
}
// Start the animation sequence
function startAnimation() {
  resetAnimation()
  isTransforming.value = true
  statusText.value = 'Analyzing source code...'
  
  // First phase: Display source code line by line
  sourceLineInterval = setInterval(() => {
    if (visibleSourceLines.value < sourceCodeLines.length) {
      visibleSourceLines.value++
    } else {
      clearInterval(sourceLineInterval)
      statusText.value = 'Transforming to Vue...'
      
      // Start typing animation after a short delay
      setTimeout(() => {
        startTypeWriterAnimation()
      }, 800)
    }
  }, 100)
}

// Type writer animation for target code
function startTypeWriterAnimation() {
  currentTypingLine.value = 0
  visibleTargetLines.value = 1
  typedCharCount.value = 0
  
  function typeLine() {
    if (currentTypingLine.value < targetCodeLines.length) {
      const currentLine = targetCodeLines[currentTypingLine.value]
      
      if (typedCharCount.value < currentLine.length) {
        // Still typing the current line
        typedCharCount.value++
      } else {
        // Current line is complete, move to the next line
        currentTypingLine.value++
        visibleTargetLines.value++
        typedCharCount.value = 0
        
        // If we still have lines to type, continue
        if (currentTypingLine.value < targetCodeLines.length) {
          return true
        } else {
          // Animation complete
          statusText.value = 'Transformation complete!'
          setTimeout(() => {
            isTransforming.value = false
          }, 1000)
          return false
        }
      }
      return true
    }
    return false
  }
  
  // Start typing with a variable speed to make it look more natural
  function typeNextChar() {
    if (typeLine()) {
      const randomDelay = Math.floor(Math.random() * 30) + 10 // 10-40ms
      typingInterval = setTimeout(typeNextChar, randomDelay)
    }
  }
  
  typeNextChar()
}

// Reset animation state
function resetAnimation() {
  clearInterval(sourceLineInterval)
  clearInterval(targetLineInterval)
  clearTimeout(typingInterval)
  clearTimeout(animationTimeout)
  
  visibleSourceLines.value = 0
  visibleTargetLines.value = 0
  currentTypingLine.value = -1
  typedCharCount.value = 0
  isTransforming.value = false
  statusText.value = 'Ready to transform'
}

// Start animation loop with automatic restart
function startAnimationLoop() {
  startAnimation()
  
  // Schedule next animation after completion
  animationTimeout = setTimeout(() => {
    resetAnimation()
    // Short delay before starting the next cycle
    setTimeout(startAnimationLoop, 1000)
  }, 15000) // Total animation time + pause
}

onMounted(() => {
  // Start the animation with a short delay after mounting
  setTimeout(startAnimationLoop, 1000)
})

onUnmounted(() => {
  // Clean up any running intervals/timeouts
  resetAnimation()
})
</script>

<style scoped>
.code-transform-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  padding: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.code-panels {
  display: flex;
  flex: 1;
  gap: 40px;
  align-items: center;
  justify-content: center;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
}

.code-panel {
  flex: 1;
  height: 500px;
  background-color: #1e1e2e;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: auto;
}

.panel-header {
  background-color: #343746;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #20222c;
}

.file-tab {
  background-color: #282a36;
  padding: 4px 12px;
  border-radius: 4px 4px 0 0;
}

.file-name {
  color: #f8f8f2;
  font-size: 0.9rem;
  font-family: 'Monaco', 'Courier New', monospace;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
}

.control:nth-child(2) {
  background-color: #ffbd2e;
}

.control:nth-child(3) {
  background-color: #27c93f;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.line-numbers {
  padding: 10px 0;
  width: 40px;
  background-color: #282a36;
  text-align: right;
  color: #6272a4;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  user-select: none;
}

.line-number {
  padding: 0 8px;
  height: 20px;
  line-height: 20px;
}

.code-content {
  flex: 1;
  padding: 10px;
  color: #f8f8f2;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  overflow-y: auto;
  overflow-x: auto;
}

.code-line {
  height: 20px;
  line-height: 20px;
  white-space: pre;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.code-line.visible {
  opacity: 1;
  transform: translateY(0);
}

.transform-arrow {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #bd93f9;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.5; transform: scale(0.95); }
}

.cursor {
  animation: blink 1s step-end infinite;
  color: #f8f8f2;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

/* Syntax highlighting */
.code-keyword {
  color: #ff79c6;
}

.code-string {
  color: #f1fa8c;
}

.code-comment {
  color: #6272a4;
}

.code-function {
  color: #8be9fd;
}

.code-element {
  color: #ff79c6;
}

.code-tag {
  color: #bd93f9;
}

.code-attr {
  color: #50fa7b;
}

.code-directive {
  color: #bd93f9;
}

.code-interpolation {
  color: #f1fa8c;
}

.code-class {
  color: #50fa7b;
}

.code-property {
  color: #8be9fd;
}

.transformation-status {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #282a36;
  border-radius: 20px;
  color: #8be9fd;
  font-size: 0.9rem;
}

.status-indicator.active svg {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .code-panels {
    flex-direction: column;
    gap: 15px;
  }
  
  .transform-arrow {
    transform: rotate(90deg);
  }
  
  .code-transform-container {
    height: auto;
    min-height: 500px;
  }
}
</style>