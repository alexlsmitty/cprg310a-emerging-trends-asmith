<template>
    <div class="animation-container">
      <div class="results-visualization">
        <!-- Initial code fragments container -->
        <div class="code-fragments-container" :class="{ 'organizing': animationStage >= 1, 'organized': animationStage >= 2 }">
          <div 
            v-for="(fragment, index) in codeFragments" 
            :key="`fragment-${index}`"
            class="code-fragment"
            :class="fragment.type"
            :style="{
              top: fragment.position.top + '%',
              left: fragment.position.left + '%',
              transitionDelay: `${index * 0.05}s`
            }"
          >
            <div class="fragment-content" v-html="fragment.content"></div>
          </div>
        </div>
        
        <!-- Report container - appears after organization -->
        <div class="report-container" :class="{ 'visible': animationStage >= 2 }">
          <!-- Report header -->
          <div class="report-header">
            <h3>Translation Report</h3>
            <div class="report-meta">
              <span>React → Vue</span>
              <span class="report-status" :class="{ 'complete': animationStage >= 3 }">
                <span class="status-indicator"></span>
                {{ animationStage >= 3 ? 'Complete' : 'Processing' }}
              </span>
            </div>
          </div>
          
          <!-- Report Body -->
          <div class="report-body">
            <!-- Summary Section -->
            <div class="report-section summary-section" :class="{ 'visible': animationStage >= 2 }">
              <h4>Translation Summary</h4>
              <div class="charts-container">
                <!-- Completion Chart -->
                <div class="chart completion-chart">
                  <div class="chart-container">
                    <svg viewBox="0 0 100 100" class="pie-chart">
                      <circle cx="50" cy="50" r="40" class="pie-chart-bg" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        class="pie-chart-fill"
                        :style="{ 
                          strokeDasharray: `${animationStage >= 3 ? 251 : (animationStage >= 2 ? 150 : 0)} 251`
                        }"
                      />
                      <text x="50" y="50" class="pie-chart-text">
                        {{ animationStage >= 3 ? '100%' : (animationStage >= 2 ? '60%' : '0%') }}
                      </text>
                    </svg>
                  </div>
                  <div class="chart-label">Completion</div>
                </div>
                
                <!-- Components Chart -->
                <div class="chart components-chart">
                  <div class="chart-container">
                    <div class="bar-chart">
                      <div 
                        class="bar-item"
                        v-for="(bar, index) in componentBars" 
                        :key="`bar-${index}`"
                        :style="{ 
                          height: `${animationStage >= 2 ? bar.height : 0}%`,
                          transitionDelay: `${0.2 + index * 0.1}s`
                        }"
                      >
                        <div class="bar-tooltip">{{ bar.name }}: {{ bar.count }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="chart-label">Components Translated</div>
                </div>
              </div>
            </div>
            
            <!-- Insights Section -->
            <div class="report-section insights-section" :class="{ 'visible': animationStage >= 3 }">
              <h4>Key Insights</h4>
              <div class="insights-list">
                <div 
                  v-for="(insight, index) in insights" 
                  :key="`insight-${index}`"
                  class="insight-item"
                  :class="insight.type"
                  :style="{ transitionDelay: `${0.4 + index * 0.15}s` }"
                >
                  <div class="insight-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path v-if="insight.type === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline v-if="insight.type === 'success'" points="22 4 12 14.01 9 11.01"></polyline>
                      
                      <circle v-if="insight.type === 'warning'" cx="12" cy="12" r="10"></circle>
                      <line v-if="insight.type === 'warning'" x1="12" y1="8" x2="12" y2="12"></line>
                      <line v-if="insight.type === 'warning'" x1="12" y1="16" x2="12.01" y2="16"></line>
                      
                      <path v-if="insight.type === 'optimization'" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                  </div>
                  <div class="insight-content">
                    <div class="insight-title">{{ insight.title }}</div>
                    <div class="insight-description">{{ insight.description }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Analytics Section -->
            <div class="report-section analytics-section" :class="{ 'visible': animationStage >= 4 }">
              <h4>Performance Analytics</h4>
              <div class="analytics-metrics">
                <div 
                  v-for="(metric, index) in performanceMetrics" 
                  :key="`metric-${index}`"
                  class="metric-item"
                  :style="{ transitionDelay: `${0.6 + index * 0.1}s` }"
                >
                  <div class="metric-name">{{ metric.name }}</div>
                  <div class="metric-bar-container">
                    <div 
                      class="metric-bar" 
                      :style="{ 
                        width: `${metric.value}%`,
                        backgroundColor: metric.color 
                      }"
                    ></div>
                  </div>
                  <div class="metric-value">{{ metric.value }}%</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Floating particles for tech aesthetic -->
          <div class="particles-container">
            <div 
              v-for="n in 15" 
              :key="`particle-${n}`" 
              class="particle"
              :style="{
                '--size': `${Math.random() * 8 + 3}px`,
                '--speed': `${Math.random() * 30 + 15}s`,
                '--delay': `${Math.random() * 5}s`,
                '--opacity': Math.random() * 0.5 + 0.1,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
  
  // Animation state
  const animationStage = ref(0); // 0: initial, 1: organizing, 2: report visible, 3: insights, 4: analytics
  
  // Sample code fragments that will be organized
  const codeFragments = reactive([
    {
      type: 'jsx',
      content: '<span class="code-keyword">function</span> <span class="code-component">App</span>() { ... }',
      position: { top: 85, left: 15 }
    },
    {
      type: 'jsx',
      content: '<span class="code-tag">&lt;div className="app"&gt;</span>',
      position: { top: 20, left: 68 }
    },
    {
      type: 'jsx',
      content: '<span class="code-keyword">const</span> [<span class="code-variable">count</span>, <span class="code-function">setCount</span>] = <span class="code-function">useState</span>(0);',
      position: { top: 35, left: 25 }
    },
    {
      type: 'jsx',
      content: '<span class="code-keyword">return</span> (',
      position: { top: 72, left: 58 }
    },
    {
      type: 'jsx',
      content: '<span class="code-tag">&lt;Button onClick={() => setCount(count + 1)}&gt;</span>',
      position: { top: 45, left: 78 }
    },
    {
      type: 'jsx',
      content: '<span class="code-component">export default</span> <span class="code-component">App</span>;',
      position: { top: 15, left: 33 }
    },
    {
      type: 'vue',
      content: '<span class="code-tag">&lt;template&gt;</span>',
      position: { top: 65, left: 22 }
    },
    {
      type: 'vue',
      content: '<span class="code-tag">&lt;button @click="increment"&gt;</span>',
      position: { top: 33, left: 52 }
    },
    {
      type: 'vue',
      content: '<span class="code-keyword">const</span> <span class="code-variable">count</span> = <span class="code-function">ref</span>(0);',
      position: { top: 55, left: 40 }
    },
    {
      type: 'vue',
      content: '<span class="code-tag">&lt;div class="app"&gt;</span>',
      position: { top: 80, left: 75 }
    },
    {
      type: 'vue',
      content: '<span class="code-keyword">function</span> <span class="code-function">increment</span>() { <span class="code-variable">count</span>.value++ }',
      position: { top: 10, left: 60 }
    },
    {
      type: 'vue',
      content: '<span class="code-tag">&lt;script setup&gt;</span>',
      position: { top: 28, left: 10 }
    }
  ]);
  
  // Sample component bars for the chart
  const componentBars = reactive([
    { name: 'App', count: 1, height: 70 },
    { name: 'Header', count: 2, height: 90 },
    { name: 'Button', count: 3, height: 60 },
    { name: 'Card', count: 2, height: 80 },
    { name: 'Footer', count: 1, height: 50 }
  ]);
  
  // Sample insights for the report
  const insights = reactive([
    {
      type: 'success',
      title: 'State Transition Complete',
      description: 'React useState hooks successfully converted to Vue 3 refs'
    },
    {
      type: 'warning',
      title: 'Context API Usage',
      description: 'Consider using Pinia instead of direct Provide/Inject for global state'
    },
    {
      type: 'optimization',
      title: 'Component Optimization',
      description: 'Use Vue\'s built-in transition components for animation effects'
    },
    {
      type: 'success',
      title: 'Event Handlers Adapted',
      description: 'React event handlers successfully converted to Vue directives'
    }
  ]);
  
  // Sample performance metrics
  const performanceMetrics = reactive([
    { name: 'Bundle Size Reduction', value: 28, color: '#4776E6' },
    { name: 'Render Performance', value: 65, color: '#42b883' },
    { name: 'Code Efficiency', value: 82, color: '#bd93f9' },
    { name: 'Browser Compatibility', value: 95, color: '#f1fa8c' }
  ]);
  
  // Run the animation sequence
  function runAnimation() {
    let timers = [];
    
    // Reset animation state
    animationStage.value = 0;
    
    // Stage 1: Start organizing code fragments (after a short delay)
    timers.push(setTimeout(() => {
      animationStage.value = 1;
      
      // Stage 2: Show report container with summary
      timers.push(setTimeout(() => {
        animationStage.value = 2;
        
        // Stage 3: Show insights
        timers.push(setTimeout(() => {
          animationStage.value = 3;
          
          // Stage 4: Show analytics
          timers.push(setTimeout(() => {
            animationStage.value = 4;
            
            // Reset and repeat after a pause
            timers.push(setTimeout(() => {
              runAnimation();
            }, 5000)); // Pause at the end before restarting
            
          }, 2000)); // Time before analytics appear
          
        }, 2000)); // Time before insights appear
        
      }, 2500)); // Time before report appears
      
    }, 1000)); // Initial delay
    
    // Return cleanup function
    return () => {
      timers.forEach(timer => clearTimeout(timer));
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
    overflow: hidden;
  }
  
  .results-visualization {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* Code fragments styling */
  .code-fragments-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
  
  .code-fragment {
    position: absolute;
    padding: 0.6rem 1rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.7rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    opacity: 0.9;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Fragment types */
  .code-fragment.jsx {
    background-color: rgba(97, 218, 251, 0.1);
    border-left: 3px solid #61dafb;
  }
  
  .code-fragment.vue {
    background-color: rgba(66, 184, 131, 0.1);
    border-left: 3px solid #42b883;
  }
  
  /* Code syntax highlighting */
  .code-keyword {
    color: #ff79c6;
  }
  
  .code-component {
    color: #50fa7b;
  }
  
  .code-tag {
    color: #bd93f9;
  }
  
  .code-function {
    color: #8be9fd;
  }
  
  .code-variable {
    color: #f1fa8c;
  }
  
  /* Animation stages for code fragments */
  .code-fragments-container.organizing .code-fragment {
    transform: scale(0.9) rotate(calc(var(--rotation, 0) * 1deg));
  }
  
  .code-fragments-container.organizing .code-fragment.jsx {
    --rotation: -5;
    top: 40% !important;
    left: 25% !important;
  }
  
  .code-fragments-container.organizing .code-fragment.vue {
    --rotation: 5;
    top: 40% !important;
    left: 75% !important;
  }
  
  .code-fragments-container.organized .code-fragment {
    opacity: 0;
    transform: scale(0.5);
  }
  
  /* Report container */
  .report-container {
    width: 85%;
    max-width: 600px;
    height: 80%;
    max-height: 450px;
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    transform: scale(0.9);
    transition: all 1s ease;
    position: relative;
    z-index: 1;
    border: 1px solid rgba(71, 118, 230, 0.3);
  }
  
  .report-container.visible {
    opacity: 1;
    transform: scale(1);
  }
  
  /* Report header */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 1.5rem;
  }
  
  .report-header h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: white;
    margin: 0;
    background: linear-gradient(90deg, #4776E6, #42b883);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  
  .report-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
  
  .report-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #f39c12;
    animation: pulse 2s infinite;
  }
  
  .report-status.complete .status-indicator {
    background-color: #42b883;
    animation: none;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  /* Report body */
  .report-body {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
  }
  
  .report-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s ease;
  }
  
  .report-section.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .report-section h4 {
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
  }
  
  /* Charts section */
  .charts-container {
    display: flex;
    gap: 1.5rem;
    justify-content: space-between;
  }
  
  .chart {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .chart-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 0.8rem;
  }
  
  .chart-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  /* Pie chart */
  .pie-chart {
    width: 100px;
    height: 100px;
  }
  
  .pie-chart-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 10;
  }
  
  .pie-chart-fill {
    fill: none;
    stroke: url(#grad);
    stroke-width: 10;
    stroke-linecap: round;
    stroke-dasharray: 0 251; /* 251 is approximately the circumference (2*PI*r) */
    transform: rotate(-90deg);
    transform-origin: center;
    transition: stroke-dasharray 1.5s ease;
  }
  
  .pie-chart-text {
    fill: white;
    font-size: 18px;
    text-anchor: middle;
    dominant-baseline: middle;
    font-weight: 600;
  }
  
  /* Bar chart */
  .bar-chart {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
  }
  
  .bar-item {
    flex: 1;
    background: linear-gradient(to top, #4776E6, #8E54E9);
    border-radius: 4px 4px 0 0;
    height: 0%;
    transition: height 1s ease;
    position: relative;
  }
  
  .bar-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    margin-bottom: 5px;
  }
  
  .bar-item:hover .bar-tooltip {
    opacity: 1;
  }
  
  /* Insights section */
  .insights-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .insight-item {
    display: flex;
    gap: 1rem;
    padding: 0.8rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(-20px);
    opacity: 0;
    transition: all 0.5s ease;
  }
  
  .report-section.visible .insight-item {
    transform: translateX(0);
    opacity: 1;
  }
  
  .insight-icon {
    display: flex;
    align-items: flex-start;
    padding: 0.3rem;
    border-radius: 50%;
  }
  
  .insight-item.success .insight-icon {
    color: #42b883;
  }
  
  .insight-item.warning .insight-icon {
    color: #f39c12;
  }
  
  .insight-item.optimization .insight-icon {
    color: #8be9fd;
  }
  
  .insight-content {
    flex: 1;
  }
  
  .insight-title {
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .insight-description {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  /* Analytics section */
  .analytics-metrics {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .metric-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    transform: translateX(-20px);
    opacity: 0;
    transition: all 0.5s ease;
  }
  
  .report-section.visible .metric-item {
    transform: translateX(0);
    opacity: 1;
  }
  
  .metric-name {
    width: 30%;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .metric-bar-container {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .metric-bar {
    height: 100%;
    width: 0;
    border-radius: 4px;
    transition: width 1s ease;
  }
  
  .metric-value {
    width: 40px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
    text-align: right;
  }
  
  /* Particle effects */
  .particles-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: -1;
  }
  
  .particle {
    position: absolute;
    width: var(--size);
    height: var(--size);
    background: linear-gradient(135deg, #4776E6, #8E54E9);
    border-radius: 50%;
    opacity: var(--opacity);
    animation: float var(--speed) linear infinite;
    animation-delay: var(--delay);
  }
  
  @keyframes float {
    0% {
      transform: translateY(0) translateX(0);
    }
    25% {
      transform: translateY(-20px) translateX(10px);
    }
    50% {
      transform: translateY(-10px) translateX(20px);
    }
    75% {
      transform: translateY(10px) translateX(5px);
    }
    100% {
      transform: translateY(0) translateX(0);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .code-fragment {
      font-size: 0.6rem;
      padding: 0.4rem 0.7rem;
      max-width: 180px;
    }
    
    .report-container {
      width: 95%;
      padding: 1rem;
    }
    
    .charts-container {
      flex-direction: column;
      gap: 2rem;
    }
    
    .report-header h3 {
      font-size: 1.2rem;
    }
    
    .report-meta {
      font-size: 0.8rem;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.3rem;
    }
    
    .report-section {
      padding: 1rem;
    }
    
    .pie-chart {
      width: 80px;
      height: 80px;
    }
    
    .bar-chart {
      height: 80px;
    }
    
    .insight-item {
      gap: 0.7rem;
    }
  }
  </style>