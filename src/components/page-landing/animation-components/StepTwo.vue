<template>
    <div class="animation-container">
      <div class="file-upload-animation">
        <!-- Upload area with animation states -->
        <div 
          class="upload-area"
          :class="{ 
            'hover': isHovering, 
            'drag-active': isDragging,
            'has-files': uploadedFiles.length > 0 
          }"
        >
          <!-- Upload content changes based on animation state -->
          <div class="upload-content">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                <path d="M12 11v6"></path>
                <path d="m9 14 3-3 3 3"></path>
              </svg>
            </div>
            <p class="upload-text">Drag and drop files or click to select</p>
            <p class="file-types">.js, .jsx, .ts, .tsx, .vue, .svelte</p>
          </div>
          
          <!-- Animated cursor -->
          <div v-if="cursorVisible && !isDragging" class="cursor" :style="cursorStyle">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
              <path d="m13 13 6 6"></path>
            </svg>
          </div>
          
          <!-- Animated file being dragged -->
          <div v-if="isDragging" class="dragged-file">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>App.jsx</span>
          </div>
        </div>
        
        <!-- File list appears after "upload" -->
        <transition-group name="file-list" tag="ul" class="files-list">
          <li v-for="(file, index) in uploadedFiles" :key="file.name" class="file-item">
            <div class="file-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span class="file-name">{{ file.name }}</span>
            </div>
          </li>
        </transition-group>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, reactive } from 'vue';
  
  // Animation state
  const cursorVisible = ref(true);
  const cursorStyle = reactive({
    top: '50%',
    left: '50%'
  });
  const isHovering = ref(false);
  const isDragging = ref(false);
  const uploadedFiles = ref([]);
  
  // Sample files for demonstration
  const sampleFiles = [
    { name: 'App.jsx', type: 'jsx' },
    { name: 'Header.jsx', type: 'jsx' },
    { name: 'Footer.jsx', type: 'jsx' },
    { name: 'styles.css', type: 'css' }
  ];
  
  // Animation timeline function
  function runAnimation() {
    let timers = [];
    
    // Reset animation state
    cursorVisible.value = true;
    isHovering.value = false;
    isDragging.value = false;
    uploadedFiles.value = [];
    
    // Initial cursor position
    cursorStyle.top = '80%';
    cursorStyle.left = '80%';
    
    // Step 1: Move cursor to upload area
    timers.push(setTimeout(() => {
      animateCursor('50%', '50%', 1000);
      
      // Step 2: Hover over upload area
      timers.push(setTimeout(() => {
        isHovering.value = true;
        
        // Step 3: Move cursor away to simulate getting a file
        timers.push(setTimeout(() => {
          animateCursor('80%', '80%', 800);
          isHovering.value = false;
          
          // Step 4: Return with a file (dragging animation)
          timers.push(setTimeout(() => {
            animateCursor('50%', '50%', 1000);
            
            // Show dragging state
            timers.push(setTimeout(() => {
              cursorVisible.value = false;
              isDragging.value = true;
              
              // Step 5: Drop the file
              timers.push(setTimeout(() => {
                isDragging.value = false;
                uploadedFiles.value = [sampleFiles[0]];
                
                // Step 6: Add more files
                let fileIndex = 1;
                const addNextFile = () => {
                  if (fileIndex < sampleFiles.length) {
                    cursorVisible.value = true;
                    
                    // Move cursor away and back to simulate getting another file
                    animateCursor('80%', '80%', 600);
                    
                    timers.push(setTimeout(() => {
                      animateCursor('50%', '50%', 600);
                      
                      timers.push(setTimeout(() => {
                        cursorVisible.value = false;
                        isDragging.value = true;
                        
                        timers.push(setTimeout(() => {
                          isDragging.value = false;
                          uploadedFiles.value = [...uploadedFiles.value, sampleFiles[fileIndex]];
                          fileIndex++;
                          
                          timers.push(setTimeout(addNextFile, 600));
                        }, 800));
                      }, 600));
                    }, 800));
                  } else {
                    // Animation complete - pause before restarting
                    timers.push(setTimeout(() => {
                      runAnimation();
                    }, 3000));
                  }
                };
                
                timers.push(setTimeout(addNextFile, 1000));
              }, 800));
            }, 500));
          }, 800));
        }, 1000));
      }, 600));
    }, 600));
    
    // Return cleanup function
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }
  
  // Helper function to animate cursor movement
  function animateCursor(top, left, duration) {
    const startTop = parseFloat(cursorStyle.top);
    const startLeft = parseFloat(cursorStyle.left);
    const endTop = parseFloat(top);
    const endLeft = parseFloat(left);
    
    const startTime = Date.now();
    
    function updateCursorPosition() {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed < duration) {
        const progress = elapsed / duration;
        // Use ease-in-out timing function
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const newTop = startTop + (endTop - startTop) * easeProgress;
        const newLeft = startLeft + (endLeft - startLeft) * easeProgress;
        
        cursorStyle.top = `${newTop}%`;
        cursorStyle.left = `${newLeft}%`;
        
        requestAnimationFrame(updateCursorPosition);
      } else {
        cursorStyle.top = `${endTop}%`;
        cursorStyle.left = `${endLeft}%`;
      }
    }
    
    requestAnimationFrame(updateCursorPosition);
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
  }
  
  .file-upload-animation {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .upload-area {
    width: 100%;
    height: 200px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(71, 118, 230, 0.05);
    position: relative;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .upload-area.hover {
    background-color: rgba(71, 118, 230, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .upload-area.drag-active {
    background-color: rgba(71, 118, 230, 0.15);
    border-color: #4776E6;
    box-shadow: 0 0 15px rgba(71, 118, 230, 0.2);
  }
  
  .upload-area.has-files {
    border-color: #4776E6;
  }
  
  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    padding: 0 1rem;
    text-align: center;
  }
  
  .upload-icon {
    color: #4776E6;
    margin-bottom: 0.5rem;
  }
  
  .upload-text {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .file-types {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  /* Cursor animation */
  .cursor {
    position: absolute;
    transform: translate(-50%, -50%);
    color: white;
    pointer-events: none;
    z-index: 10;
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
    animation: cursor-pulse 2s infinite;
  }
  
  @keyframes cursor-pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
  }
  
  /* Dragged file animation */
  .dragged-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: white;
    background-color: rgba(71, 118, 230, 0.3);
    padding: 1rem;
    border-radius: 8px;
    animation: file-float 1s infinite alternate;
  }
  
  .dragged-file span {
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  @keyframes file-float {
    0% { transform: translate(-50%, -50%) scale(1); }
    100% { transform: translate(-50%, -50%) scale(1.05); }
  }
  
  /* File list */
  .files-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0 0 0;
    width: 100%;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1rem;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    transition: all 0.2s ease;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .file-name {
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  /* Transition animations for file list */
  .file-list-enter-active,
  .file-list-leave-active {
    transition: all 0.3s ease;
  }
  
  .file-list-enter-from,
  .file-list-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .file-list-move {
    transition: transform 0.3s ease;
  }
  </style>