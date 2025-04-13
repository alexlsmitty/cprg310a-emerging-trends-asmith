<template>
    <div class="animation-container">
      <div class="step-title" :class="{ 'active': animationStep >= 1 }">
        {{ animationStep < 2 ? 'Source Framework' : 'Target Framework' }}
      </div>
      
      <div class="animation-content">
        <!-- Frameworks grid -->
        <div class="frameworks-grid">
          <div 
            v-for="(framework, index) in frameworks" 
            :key="framework.id"
            class="framework-card"
            :class="{ 
              'active-source': selectedSource === framework.id,
              'active-target': selectedTarget === framework.id,
              'hover': cursorPosition === index && !isComplete,
              'disabled': selectedSource === framework.id && animationStep === 2
            }"
          >
            <component :is="framework.icon" class="framework-icon" />
            <div class="framework-name">{{ framework.name }}</div>
            
            <!-- Cursor indicator -->
            <div v-if="cursorPosition === index && !isComplete" class="cursor-element">
              <CursorIcon class="cursor-icon" />
            </div>
          </div>
        </div>
        
        <!-- Connection visualization - always present but only visible when both frameworks are selected -->
        <div class="connection-container" :class="{ 'visible': isComplete }">
          <div class="connection-line">
            <div class="source-icon-container">
              <component :is="getIconById(selectedSource || 'react')" class="connection-icon" />
            </div>
            <div class="arrow-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
            <div class="target-icon-container">
              <component :is="getIconById(selectedTarget || 'vue')" class="connection-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import ReactIcon from '../../icons/FrameworkIconReact.vue';
  import VueIcon from '../../icons/FrameworkIconVue.vue';
  import AngularIcon from '../../icons/FrameworkIconAngular.vue';
  import SvelteIcon from '../../icons/FrameworkIconSvelte.vue';
  import NextJsIcon from '../../icons/FrameworkIconNextJs.vue';
  import NuxtIcon from '../../icons/FrameworkIconNuxt.vue';
  import CursorIcon from '../../icons/animated-icons/fluent_cursor-20-filled.vue';
  
  // Framework data
  const frameworks = [
    { id: 'react', name: 'React', icon: ReactIcon },
    { id: 'vue', name: 'Vue', icon: VueIcon },
    { id: 'angular', name: 'Angular', icon: AngularIcon },
    { id: 'svelte', name: 'Svelte', icon: SvelteIcon },
    { id: 'nextjs', name: 'Next.js', icon: NextJsIcon },
    { id: 'nuxt', name: 'Nuxt', icon: NuxtIcon }
  ];
  
  // Animation state
  const animationStep = ref(0); // 0: initial, 1: source selection, 2: target selection, 3: complete
  const cursorPosition = ref(0);
  const selectedSource = ref(null);
  const selectedTarget = ref(null);
  const isComplete = computed(() => selectedSource.value && selectedTarget.value);
  
  // Helper function to get framework icon by id
  function getIconById(id) {
    const framework = frameworks.find(f => f.id === id);
    return framework ? framework.icon : ReactIcon;
  }
  
  // Animation controller
  function runAnimation() {
    let timers = [];
    
    // Reset state
    animationStep.value = 0;
    cursorPosition.value = 0;
    selectedSource.value = null;
    selectedTarget.value = null;
    
    // Start animation after a short delay
    timers.push(setTimeout(() => {
      // Step 1: Source selection
      animationStep.value = 1;
      
      // Move cursor horizontally across framework options
      let sourceSelectionComplete = false;
      
      function moveCursor() {
        if (sourceSelectionComplete) return;
        
        // Move cursor to next position
        cursorPosition.value = (cursorPosition.value + 1) % frameworks.length;
        
        // Select React after cursor has moved a few times
        if (cursorPosition.value === 0 && animationStep.value === 1) {
          timers.push(setTimeout(() => {
            selectedSource.value = 'react';
            sourceSelectionComplete = true;
            
            // Begin target selection
            timers.push(setTimeout(() => {
              animationStep.value = 2;
              cursorPosition.value = 0;
              sourceSelectionComplete = false;
              
              // Continue cursor movement for target selection
              let targetSelectionComplete = false;
              
              function moveTargetCursor() {
                if (targetSelectionComplete) return;
                
                // Move cursor for target selection
                cursorPosition.value = (cursorPosition.value + 1) % frameworks.length;
                
                // Select Vue as target when cursor reaches it
                if (cursorPosition.value === 1 && !targetSelectionComplete) {
                  timers.push(setTimeout(() => {
                    selectedTarget.value = 'vue';
                    targetSelectionComplete = true;
                    
                    // Complete the animation
                    timers.push(setTimeout(() => {
                      animationStep.value = 3;
                      
                      // Reset after showing completed state
                      timers.push(setTimeout(() => {
                        runAnimation();
                      }, 4000));
                    }, 1000));
                  }, 400));
                }
                
                if (!targetSelectionComplete) {
                  timers.push(setTimeout(moveTargetCursor, 600));
                }
              }
              
              moveTargetCursor();
            }, 1000));
          }, 400));
        }
        
        if (!sourceSelectionComplete) {
          timers.push(setTimeout(moveCursor, 600));
        }
      }
      
      moveCursor();
    }, 500));
    
    // Return cleanup function
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }
  
  // Start animation on mount
  let cleanup;
  onMounted(() => {
    cleanup = runAnimation();
  });
  
  // Clean up on unmount
  onBeforeUnmount(() => {
    if (cleanup) cleanup();
  });
  </script>
  
  <style scoped>
.animation-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  height: 350px; /* Fixed height to prevent layout shifts */
  position: relative;
}

.animation-content {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #8491a9;
  margin-bottom: 2rem;
  transition: color 0.3s ease;
}

.step-title.active {
  color: #4776E6;
}

.frameworks-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
}

.framework-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  background-color: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  position: relative;
  transition: all 0.3s ease;
}

.framework-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 0.75rem;
}

.framework-name {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Hover state */
.framework-card.hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  background-color: rgba(40, 51, 69, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Selected states */
.framework-card.active-source {
  background-color: rgba(71, 118, 230, 0.2);
  border-color: #4776E6;
  box-shadow: 0 0 15px rgba(71, 118, 230, 0.3);
}

.framework-card.active-target {
  background-color: rgba(142, 84, 233, 0.2);
  border-color: #8E54E9;
  box-shadow: 0 0 15px rgba(142, 84, 233, 0.3);
}

.framework-card.disabled {
  opacity: 0.5;
}

/* Cursor element */
.cursor-element {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
}

.cursor-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.7));
  animation: hover-cursor 2s ease-in-out infinite;
}

@keyframes hover-cursor {
  0%, 100% { transform: translateY(0) rotate(5deg); }
  50% { transform: translateY(-3px) rotate(8deg); }
}

/* Connection visualization */
.connection-container {
  position: absolute;
  bottom: -80px;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  pointer-events: none; /* Ensure it doesn't interfere with interactions */
}

.connection-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.connection-line {
  position: relative;
  height: 100%;
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.connection-line:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 3px;
  background: linear-gradient(90deg, #4776E6, #8E54E9);
  transform: translateY(-50%);
  z-index: 1;
}

.source-icon-container, .target-icon-container {
  width: 50px;
  height: 50px;
  background-color: #1e293b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 8px;
}

.source-icon-container {
  border: 2px solid #4776E6;
  box-shadow: 0 0 10px rgba(71, 118, 230, 0.4);
}

.target-icon-container {
  border: 2px solid #8E54E9;
  box-shadow: 0 0 10px rgba(142, 84, 233, 0.4);
}

.connection-icon {
  width: 100%;
  height: 100%;
}

.arrow-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #1e293b;
  border-radius: 50%;
  padding: 8px;
  z-index: 2;
  color: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .frameworks-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .framework-icon {
    width: 30px;
    height: 30px;
  }
  
  .framework-name {
    font-size: 0.8rem;
  }
}
</style>