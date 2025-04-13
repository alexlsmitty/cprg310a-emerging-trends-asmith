<template>
  <div class="animation-container">
    <div class="translation-visualization">
      <!-- Translation Process Animation -->
      <div class="translation-process">
        <!-- Source Framework Icon - Positioned above source code blocks -->
        <div class="framework-indicator source" :class="{ 'active': animationStage >= 1 }">
          <div class="framework-icon-container">
            <div class="icon-background"></div>
            <ReactIcon class="framework-icon" />
          </div>
          <span class="framework-label">React</span>
        </div>

        <!-- Original Code Blocks -->
        <div class="code-blocks source-blocks" :class="{ 'separated': animationStage >= 2 }">
          <div 
            v-for="(block, index) in codeBlocks" 
            :key="`source-${index}`"
            class="code-block source-block"
            :class="{ 'processing': processingIndex === index }"
            :style="{ 
              transitionDelay: `${index * 0.1}s`,
              zIndex: codeBlocks.length - index
            }"
          >
            <div class="block-header">
              <span class="block-title">{{ block.title }}</span>
              <span class="block-type">{{ block.type }}</span>
            </div>
            <div class="block-content">
              <div v-for="(line, lineIndex) in block.code" :key="`source-${index}-line-${lineIndex}`" class="code-line">
                <span v-html="formatReactCode(line)"></span>
              </div>
            </div>
            <div class="context-halo" :class="{ 'active': animationStage >= 2 }"></div>
          </div>
        </div>
        
        <!-- Translation Chamber -->
        <div class="translation-chamber" :class="{ 'active': animationStage >= 3 }">
          <!-- Transformation Gears -->
          <div class="transformation-gears">
            <div class="gear gear-1"></div>
            <div class="gear gear-2"></div>
            <div class="gear gear-3"></div>
          </div>
          
          <!-- Processing Block (current block being translated) -->
          <div class="processing-block" v-if="processingIndex !== null">
            <div class="processing-content">
              <div class="morphing-code">
                <div v-for="(line, lineIndex) in getMorphingCode()" :key="`morph-line-${lineIndex}`" class="code-line">
                  <span v-html="line"></span>
                </div>
              </div>
            </div>
            <div class="processing-indicators">
              <div class="indicator syntax">Syntax</div>
              <div class="indicator structure">Structure</div>
              <div class="indicator logic">Logic</div>
            </div>
          </div>
        </div>
        
        <!-- Target Framework Icon - Positioned above target code blocks -->
        <div class="framework-indicator target" :class="{ 'active': animationStage >= 4 }">
          <div class="framework-icon-container">
            <div class="icon-background"></div>
            <VueIcon class="framework-icon" />
          </div>
          <span class="framework-label">Vue</span>
        </div>

        <!-- Transformed Code Blocks -->
        <div class="code-blocks target-blocks" :class="{ 'filled': animationStage >= 4 }">
          <div 
            v-for="(block, index) in codeBlocks" 
            :key="`target-${index}`"
            class="code-block target-block"
            :class="{ 'filled': transformedBlocks.includes(index) }"
            :style="{ 
              transitionDelay: `${index * 0.1}s`,
              zIndex: codeBlocks.length - index
            }"
          >
            <div class="block-header">
              <span class="block-title">{{ block.title }}</span>
              <span class="block-type">{{ block.type }}</span>
            </div>
            <div class="block-content">
              <div v-for="(line, lineIndex) in getTransformedCode(index)" :key="`target-${index}-line-${lineIndex}`" class="code-line">
                <span v-html="formatVueCode(line)"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Connection Lines -->
      <svg class="connection-lines" :class="{ 'active': animationStage >= 2 }">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#61dafb" />
            <stop offset="100%" stop-color="#42b883" />
          </linearGradient>
        </defs>
        <path 
          v-for="(connection, index) in connections" 
          :key="`connection-${index}`"
          :d="connection.path" 
          class="connection-path"
          :style="{ 
            strokeDasharray: connection.length,
            strokeDashoffset: animationStage >= 2 ? '0' : connection.length,
            transitionDelay: `${0.3 + index * 0.1}s`
          }"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import ReactIcon from '../../icons/animated-icons/mdi_react.vue';
import VueIcon from '../../icons/animated-icons/teenyicons_vue-solid.vue';

// Sample code blocks for the animation
const codeBlocks = [
  {
    title: 'App.jsx',
    type: 'Component',
    code: [
      "function App() {",
      "  const [count, setCount] = useState(0);",
      "",
      "  return (",
      "    <div className=\"app\">",
      "      <h1>Counter: {count}</h1>",
      "      <button onClick={() => setCount(count + 1)}>",
      "        Increment",
      "      </button>",
      "    </div>",
      "  );",
      "}"
    ]
  },
  {
    title: 'Header.jsx',
    type: 'Component',
    code: [
      "function Header({ title }) {",
      "  return (",
      "    <header className=\"header\">",
      "      <h1>{title}</h1>",
      "      <nav>",
      "        <ul>",
      "          <li><a href=\"#\">Home</a></li>",
      "          <li><a href=\"#\">About</a></li>",
      "        </ul>",
      "      </nav>",
      "    </header>",
      "  );",
      "}"
    ]
  },
  {
    title: 'useData.js',
    type: 'Hook',
    code: [
      "function useData() {",
      "  const [data, setData] = useState(null);",
      "  const [loading, setLoading] = useState(true);",
      "",
      "  useEffect(() => {",
      "    fetchData()",
      "      .then(result => {",
      "        setData(result);",
      "        setLoading(false);",
      "      });",
      "  }, []);",
      "",
      "  return { data, loading };",
      "}"
    ]
  }
];

// Animation state management
const animationStage = ref(0); // 0: initial, 1: source, 2: separation, 3: processing, 4: target
const processingIndex = ref(null);
const transformedBlocks = ref([]);
const morphProgress = ref(0); // 0-100% progress of current morphing animation

// Connection paths between blocks
const connections = [
  { path: "M250,80 C300,80 350,140 400,140", length: "200" },
  { path: "M250,160 C320,160 330,200 400,200", length: "200" },
  { path: "M250,220 C310,220 340,260 400,260", length: "200" }
];

// Using separate functions for each type of transformed code
// to avoid string template issues
function getAppCodeTransformed() {
  return [
    "&lt;template&gt;",
    "  &lt;div class=\"app\"&gt;",
    "    &lt;h1&gt;Counter: {{ count }}&lt;/h1&gt;",
    "    &lt;button @click=\"increment\"&gt;",
    "      Increment",
    "    &lt;/button&gt;",
    "  &lt;/div&gt;",
    "&lt;/template&gt;",
    "",
    "&lt;script setup&gt;",
    "import { ref } from 'vue';",
    "",
    "const count = ref(0);",
    "",
    "function increment() {",
    "  count.value++;",
    "}",
    "&lt;/script&gt;"
  ];
}

function getHeaderCodeTransformed() {
  return [
    "&lt;template&gt;",
    "  &lt;header class=\"header\"&gt;",
    "    &lt;h1&gt;{{ title }}&lt;/h1&gt;",
    "    &lt;nav&gt;",
    "      &lt;ul&gt;",
    "        &lt;li&gt;&lt;a href=\"#\"&gt;Home&lt;/a&gt;&lt;/li&gt;",
    "        &lt;li&gt;&lt;a href=\"#\"&gt;About&lt;/a&gt;&lt;/li&gt;",
    "      &lt;/ul&gt;",
    "    &lt;/nav&gt;",
    "  &lt;/header&gt;",
    "&lt;/template&gt;",
    "",
    "&lt;script setup&gt;",
    "defineProps({",
    "  title: String",
    "});",
    "&lt;/script&gt;"
  ];
}

function getHookCodeTransformed() {
  return [
    "import { ref, onMounted } from 'vue';",
    "",
    "export function useData() {",
    "  const data = ref(null);",
    "  const loading = ref(true);",
    "",
    "  onMounted(async () => {",
    "    try {",
    "      const result = await fetchData();",
    "      data.value = result;",
    "      loading.value = false;",
    "    } catch (error) {",
    "      console.error(error);",
    "    }",
    "  });",
    "",
    "  return { data, loading };",
    "}"
  ];
}

// Get transformed code based on index
function getTransformedCode(index) {
  if (index === 0) {
    return getAppCodeTransformed();
  } else if (index === 1) {
    return getHeaderCodeTransformed();
  } else if (index === 2) {
    return getHookCodeTransformed();
  }
  return [];
}

// Get the code lines for the morphing animation based on processing index
function getMorphingCode() {
  if (processingIndex.value === null) return [];
  
  const sourceCode = codeBlocks[processingIndex.value].code;
  const transformedCode = getTransformedCode(processingIndex.value);
  
  // Blend source and transformed code based on morph progress
  if (morphProgress.value < 30) {
    return sourceCode;
  } else if (morphProgress.value < 70) {
    // Show a mix of both
    const mixed = [];
    for (let i = 0; i < Math.max(sourceCode.length, transformedCode.length); i++) {
      if (i % 2 === 0 && i < transformedCode.length) {
        mixed.push(transformedCode[i]);
      } else if (i < sourceCode.length) {
        mixed.push(sourceCode[i]);
      }
    }
    return mixed;
  } else {
    return transformedCode;
  }
}

// Syntax highlighting for React code
function formatReactCode(line) {
  return line
    .replace(/(['"])(.*?)\1/g, '<span class="code-string">$&</span>') // Strings
    .replace(/\b(function|const|return|import|export|from|useState|useEffect)\b/g, '<span class="code-keyword">$&</span>') // Keywords
    .replace(/\b(App|Header|useData)\b/g, '<span class="code-component">$&</span>') // Components
    .replace(/\b(className|onClick)\b/g, '<span class="code-attr">$&</span>') // Attributes
    .replace(/(&lt;\/?\w+(&gt;|[\s\w="{}]*)&gt;?)/g, '<span class="code-tag">$&</span>') // JSX tags
    .replace(/\{([^{}]*)\}/g, '<span class="code-expression">{$1}</span>'); // JSX expressions
}

// Syntax highlighting for Vue code
function formatVueCode(line) {
  return line
    .replace(/(['"])(.*?)\1/g, '<span class="code-string-vue">$&</span>') // Strings
    .replace(/\b(import|export|from|const|function|return|ref|onMounted|defineProps|try|catch|await|async)\b/g, '<span class="code-keyword-vue">$&</span>') // Keywords
    .replace(/\b(value)\b/g, '<span class="code-property-vue">$&</span>') // Properties
    .replace(/\b(class|@click)\b/g, '<span class="code-attr-vue">$&</span>') // Attributes
    .replace(/(&lt;\/?\w+(&gt;|[\s\w="{}@]*)&gt;?)/g, '<span class="code-tag-vue">$&</span>') // Vue template tags
    .replace(/\{\{([^{}]*)\}\}/g, '<span class="code-expression-vue">{{$1}}</span>'); // Vue expressions
}

// Run the animation sequence
function runAnimation() {
  let timers = [];
  
  // Reset animation state
  animationStage.value = 0;
  processingIndex.value = null;
  transformedBlocks.value = [];
  morphProgress.value = 0;
  
  // Step 1: Show source framework
  timers.push(setTimeout(() => {
    animationStage.value = 1;
    
    // Step 2: Separate code blocks
    timers.push(setTimeout(() => {
      animationStage.value = 2;
      
      // Step 3: Start processing each block
      let currentBlockIndex = 0;
      
      function processNextBlock() {
        if (currentBlockIndex < codeBlocks.length) {
          processingIndex.value = currentBlockIndex;
          animationStage.value = 3;
          morphProgress.value = 0;
          
          // Animate morphing progress
          const morphInterval = setInterval(() => {
            morphProgress.value += 2;
            if (morphProgress.value >= 100) {
              clearInterval(morphInterval);
              
              // Block translation complete
              transformedBlocks.value.push(currentBlockIndex);
              
              // Move to next block
              currentBlockIndex++;
              
              timers.push(setTimeout(() => {
                processNextBlock();
              }, 500));
            }
          }, 50);
          
          timers.push(() => clearInterval(morphInterval));
        } else {
          // All blocks processed, show final stage
          processingIndex.value = null;
          animationStage.value = 4;
          
          // Loop animation after delay
          timers.push(setTimeout(() => {
            runAnimation();
          }, 4000));
        }
      }
      
      // Start processing first block
      timers.push(setTimeout(() => {
        processNextBlock();
      }, 1000));
    }, 1500));
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
  perspective: 1200px;
}

.translation-visualization {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Translation process - Rearranged to have framework indicators above code blocks */
.translation-process {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 70px; /* Space for framework icons */
  padding-bottom: 20px;
}

/* Framework indicators - Repositioned above code blocks */
.framework-indicator {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.8s ease;
  z-index: 5;
}

.framework-indicator.source {
  left: 16%; /* Position centered above source code blocks */
  top: 0;
}

.framework-indicator.target {
  right: 16%; /* Position centered above target code blocks */
  top: 0;
}

.framework-indicator.active {
  opacity: 1;
  transform: translateY(0);
}

/* Framework icon container with hover animation */
.framework-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  padding: 8px;
  animation: floating 3s ease-in-out infinite;
}

/* Icon background with opacity */
.icon-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(20, 30, 45, 0.7);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: -1;
}

.framework-indicator.source .icon-background {
  border: 2px solid #61dafb; /* React blue */
  box-shadow: 0 4px 15px rgba(97, 218, 251, 0.3);
}

.framework-indicator.target .icon-background {
  border: 2px solid #42b883; /* Vue green */
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
}

/* Hovering animation */
@keyframes floating {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

.framework-icon {
  width: 100%;
  height: 100%;
}

.framework-label {
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.framework-indicator.source .framework-label {
  color: #61dafb; /* React blue */
}

.framework-indicator.target .framework-label {
  color: #42b883; /* Vue green */
}

/* Code blocks */
.code-blocks {
  width: 32%;
  position: relative;
  height: 280px;
}

.source-blocks {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
}

.source-blocks.separated {
  gap: 1.5rem;
}

.target-blocks {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 1.5rem;
}

.code-block {
  width: 90%;
  background-color: rgba(30, 41, 59, 0.8);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.6rem;
  line-height: 1.3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  transition: all 0.8s ease;
}

.source-block {
  border-left: 3px solid #61dafb; /* React blue */
  transform-origin: left center;
}

.target-block {
  border-left: 3px solid #42b883; /* Vue green */
  transform-origin: right center;
  opacity: 0;
  transform: translateX(20px);
}

.target-blocks.filled .target-block.filled {
  opacity: 1;
  transform: translateX(0);
}

.code-block.processing {
  box-shadow: 0 0 15px rgba(71, 118, 230, 0.6);
}

.block-header {
  padding: 0.4rem 0.6rem;
  background-color: rgba(20, 30, 45, 0.7);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.block-title {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.block-type {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.6);
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.block-content {
  padding: 0.6rem;
  max-height: 150px;
  overflow-y: auto;
  color: rgba(255, 255, 255, 0.8);
}

.code-line {
  white-space: pre;
  margin-bottom: 0.15rem;
}

/* Context halos */
.context-halo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 0 0 0 transparent;
  transition: all 1s ease;
  pointer-events: none;
  z-index: -1;
}

.context-halo.active {
  box-shadow: 0 0 15px rgba(71, 118, 230, 0.2);
}

/* Translation chamber */
.translation-chamber {
  width: 30%;
  height: 220px;
  border-radius: 12px;
  background-color: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(71, 118, 230, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.8s ease;
}

.translation-chamber.active {
  opacity: 1;
  transform: translateY(0);
  box-shadow: 0 0 20px rgba(71, 118, 230, 0.3);
}

/* Transformation gears */
.transformation-gears {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  pointer-events: none;
}

.gear {
  position: absolute;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.6);
  background: radial-gradient(
    circle,
    rgba(71, 118, 230, 0.3) 0%,
    rgba(71, 118, 230, 0.1) 70%,
    transparent 100%
  );
}

.gear::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
}

.gear-1 {
  width: 60px;
  height: 60px;
  top: 30px;
  left: 40px;
  animation: rotate 20s linear infinite;
}

.gear-2 {
  width: 80px;
  height: 80px;
  bottom: 20px;
  right: 30px;
  animation: rotate 25s linear infinite reverse;
}

.gear-3 {
  width: 50px;
  height: 50px;
  bottom: 40px;
  left: 50px;
  animation: rotate 15s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Processing block */
.processing-block {
  width: 90%;
  height: 80%;
  padding: 0.8rem;
  position: relative;
  z-index: 1;
}

.processing-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: rgba(20, 30, 45, 0.8);
  padding: 0.6rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.6rem;
  line-height: 1.3;
  position: relative;
}

.morphing-code {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  color: rgba(255, 255, 255, 0.8);
}

.processing-indicators {
  position: absolute;
  right: 0;
  bottom: -1rem;
  display: flex;
  gap: 0.5rem;
}

.indicator {
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: rgba(30, 41, 59, 0.8);
  animation: pulse 2s infinite alternate;
}

.indicator.syntax {
  color: #ff79c6;
  border-left: 2px solid #ff79c6;
}

.indicator.structure {
  color: #bd93f9;
  border-left: 2px solid #bd93f9;
}

.indicator.logic {
  color: #50fa7b;
  border-left: 2px solid #50fa7b;
}

@keyframes pulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

/* Connection lines */
.connection-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.connection-lines.active {
  opacity: 1;
}

.connection-path {
  fill: none;
  stroke: url(#connectionGradient);
  stroke-width: 1.5;
  opacity: 0.7;
  transition: stroke-dashoffset 1.5s ease;
}

/* Syntax highlighting - React */
.code-string {
  color: #f1fa8c;
}

.code-keyword {
  color: #ff79c6;
}

.code-component {
  color: #50fa7b;
}

.code-tag {
  color: #ff79c6;
}

.code-attr {
  color: #8be9fd;
}

.code-expression {
  color: #f1fa8c;
}

/* Syntax highlighting - Vue */
.code-string-vue {
  color: #f1fa8c;
}

.code-keyword-vue {
  color: #bd93f9;
}

.code-component-vue {
  color: #50fa7b;
}

.code-tag-vue {
  color: #42b883;
}

.code-attr-vue {
  color: #8be9fd;
}

.code-expression-vue {
  color: #f1fa8c;
}

.code-property-vue {
  color: #ff79c6;
}

/* Media Queries */
@media (max-width: 768px) {
  .translation-visualization {
    transform: scale(0.8);
  }
  
  .code-block, .processing-content {
    font-size: 0.5rem;
  }
  
  /* Adjust framework indicator positions for mobile */
  .framework-indicator.source {
    left: 10%;
  }
  
  .framework-indicator.target {
    right: 10%;
  }
}
</style>