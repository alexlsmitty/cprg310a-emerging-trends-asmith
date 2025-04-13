<template>
    <svg 
      width="84" 
      height="44" 
      viewBox="0 0 84 44" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="transfusion-logo"
      :class="{ 'logo-hover': isHovered }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Left File Icons Stack -->
      <g class="file-stack left-stack">
        <g v-for="i in 7" :key="`left-file-${i}`" class="file-item-group" :style="{
            transform: `translate(0px, ${(i - 1) * 1.75}px)`,
            zIndex: 7 - i
          }">
          <!-- Main colored file icon -->
          <path 
            fill-rule="evenodd" 
            clip-rule="evenodd" 
            :d="leftFileIconPath" 
            :fill="currentColors[i - 1]"
            class="file-icon"
          />
          <!-- Inner window rectangle - creates depth effect -->
          <path 
            d="M13 11.5C13 10.6716 13.6716 10 14.5 10H25.5C26.3284 10 27 10.6716 27 11.5V25.5C27 26.3284 26.3284 27 25.5 27H14.5C13.6716 27 13 26.3284 13 25.5V11.5Z" 
            fill="black"
            fill-opacity="0.2"
            class="window-effect"
          />
        </g>
      </g>
      
      <!-- Right File Icons Stack -->
      <g class="file-stack right-stack">
        <g v-for="i in 7" :key="`right-file-${i}`" class="file-item-group" :style="{
            transform: `translate(0px, ${(i - 1) * 1.75}px)`,
            zIndex: 7 - i
          }">
          <!-- Main colored file icon -->
          <path 
            fill-rule="evenodd" 
            clip-rule="evenodd" 
            :d="rightFileIconPath" 
            :fill="currentColors[i - 1]"
            class="file-icon"
          />
          <!-- Inner window rectangle - creates depth effect -->
          <path 
            d="M55 11.5C55 10.6716 55.6716 10 56.5 10H67.5C68.3284 10 69 10.6716 69 11.5V25.5C69 26.3284 68.3284 27 67.5 27H56.5C55.6716 27 55 26.3284 55 25.5V11.5Z" 
            fill="black"
            fill-opacity="0.2"
            class="window-effect"
          />
        </g>
      </g>
      
      <!-- Animated center arrow path -->
      <g class="center-arrows" :style="arrowRotationStyle">
        <path 
          d="M33.548 19.7349C33.9959 18.0632 34.9294 16.5618 36.2306 15.4207C37.5318 14.2796 39.1422 13.55 40.858 13.3241C42.5739 13.0982 44.3182 13.3863 45.8704 14.1518C47.4225 14.9174 48.7128 16.126 49.578 17.6249L49.913 18.3839M49.913 18.3839C50.1469 18.3452 50.3594 18.2248 50.5127 18.044C50.666 17.8633 50.7501 17.6339 50.75 17.3969V13.2499M49.913 18.3839C49.8597 18.3926 49.8053 18.3969 49.75 18.3969H45.603M33.25 30.7499V26.6029C33.25 26.3377 33.3554 26.0833 33.5429 25.8958C33.7304 25.7082 33.9848 25.6029 34.25 25.6029M34.25 25.6029H38.397M34.25 25.6029L34.422 26.3749C35.2872 27.8738 36.5775 29.0824 38.1296 29.8479C39.6818 30.6135 41.4261 30.9015 43.142 30.6757C44.8578 30.4498 46.4682 29.7202 47.7694 28.5791C49.0706 27.438 50.0041 25.9366 50.452 24.2649" 
          stroke="white" 
          stroke-width="3.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </g>
    </svg>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  
  const props = defineProps({
    animate: {
      type: Boolean,
      default: true
    }
  })
  
  // Color palette
  const colorPalette = [
    '#FF6B6B',  // Coral Red
    '#FF9F1C',  // Warm Orange
    '#2EC4B6',  // Teal
    '#4776E6',  // Vibrant Blue
    '#8E54E9',  // Soft Purple
    '#6A4C93',  // Deep Purple
    '#1982C4',  // Bright Blue
  ]
  
  // Use reactive for direct color manipulation
  const currentColors = reactive([...colorPalette])
  
  // Path data for file icons from the Figma SVG
  const leftFileIconPath = "M11.1543 4.26465C8.39287 4.26465 6.1543 6.50322 6.1543 9.26465V27.2646C6.1543 30.0261 8.39287 32.2646 11.1543 32.2646H29.1543C31.9157 32.2646 34.1543 30.0261 34.1543 27.2646V9.26465C34.1543 6.50322 31.9157 4.26465 29.1543 4.26465H11.1543ZM23.1488 8.00094L28.8027 13.6548C28.8776 13.7299 28.9371 13.819 28.9776 13.917C29.0182 14.0151 29.039 14.1201 29.0389 14.2262V27.1493C29.0389 27.5777 28.8687 27.9886 28.5658 28.2916C28.2628 28.5945 27.852 28.7647 27.4235 28.7647H12.8851C12.4566 28.7647 12.0458 28.5945 11.7428 28.2916C11.4399 27.9886 11.2697 27.5777 11.2697 27.1493V9.38008C11.2697 8.95165 11.4399 8.54077 11.7428 8.23783C12.0458 7.93488 12.4566 7.76469 12.8851 7.76469H22.5774C22.6835 7.76461 22.7885 7.78543 22.8866 7.82597C22.9846 7.8665 23.0738 7.92596 23.1488 8.00094ZM18.4778 22.8016C18.4372 22.7035 18.3777 22.6144 18.3027 22.5394L16.45 20.6878L18.3027 18.8361C18.4542 18.6846 18.5394 18.479 18.5394 18.2647C18.5394 18.0504 18.4542 17.8448 18.3027 17.6932C18.1511 17.5417 17.9456 17.4566 17.7312 17.4566C17.5169 17.4566 17.3113 17.5417 17.1598 17.6932L14.7367 20.1163C14.6616 20.1913 14.602 20.2804 14.5614 20.3785C14.5207 20.4765 14.4998 20.5816 14.4998 20.6878C14.4998 20.7939 14.5207 20.899 14.5614 20.9971C14.602 21.0951 14.6616 21.1842 14.7367 21.2592L17.1598 23.6823C17.2348 23.7573 17.3239 23.8169 17.422 23.8575C17.52 23.8981 17.6251 23.919 17.7312 23.919C17.8373 23.919 17.9424 23.8981 18.0405 23.8575C18.1385 23.8169 18.2276 23.7573 18.3027 23.6823C18.3777 23.6072 18.4372 23.5182 18.4778 23.4201C18.5185 23.3221 18.5394 23.217 18.5394 23.1108C18.5394 23.0047 18.5185 22.8996 18.4778 22.8016ZM23.1488 23.6823L25.5719 21.2592C25.647 21.1842 25.7066 21.0951 25.7472 20.9971C25.7879 20.899 25.8088 20.7939 25.8088 20.6878C25.8088 20.5816 25.7879 20.4765 25.7472 20.3785C25.7066 20.2804 25.647 20.1913 25.5719 20.1163L23.1488 17.6932C22.9973 17.5417 22.7917 17.4566 22.5774 17.4566C22.363 17.4566 22.1575 17.5417 22.0059 17.6932C21.8544 17.8448 21.7692 18.0504 21.7692 18.2647C21.7692 18.479 21.8544 18.6846 22.0059 18.8361L23.8586 20.6878L22.0059 22.5394C21.8544 22.691 21.7692 22.8965 21.7692 23.1108C21.7692 23.3252 21.8544 23.5307 22.0059 23.6823C22.1575 23.8338 22.363 23.919 22.5774 23.919C22.7917 23.919 22.9973 23.8338 23.1488 23.6823ZM22.5774 9.78392V14.2262H27.0197L22.5774 9.78392Z"
  
  const rightFileIconPath = "M48.1543 9.26465C48.1543 6.50322 50.3929 4.26465 53.1543 4.26465H71.1543C73.9157 4.26465 76.1543 6.50322 76.1543 9.26465V27.2646C76.1543 30.0261 73.9157 32.2646 71.1543 32.2646H53.1543C50.3929 32.2646 48.1543 30.0261 48.1543 27.2646V9.26465ZM67.7472 20.3785C67.7066 20.2804 67.647 20.1913 67.5719 20.1163L65.1488 17.6933C64.9973 17.5417 64.7917 17.4566 64.5774 17.4566C64.363 17.4566 64.1575 17.5417 64.0059 17.6933C63.8544 17.8448 63.7692 18.0504 63.7692 18.2647C63.7692 18.479 63.8544 18.6846 64.0059 18.8361L65.8586 20.6878L64.0059 22.5394C63.8544 22.691 63.7692 22.8965 63.7692 23.1108C63.7692 23.3252 63.8544 23.5307 64.0059 23.6823C64.1575 23.8338 64.363 23.919 64.5774 23.919C64.7917 23.919 64.9973 23.8338 65.1488 23.6823L67.5719 21.2592C67.647 21.1842 67.7066 21.0951 67.7472 20.9971C67.7879 20.899 67.8088 20.7939 67.8088 20.6878C67.8088 20.5816 67.7879 20.4765 67.7472 20.3785ZM60.0405 17.5179C60.1386 17.5586 60.2276 17.6182 60.3027 17.6933C60.3778 17.7683 60.4373 17.8573 60.478 17.9554C60.5186 18.0534 60.5395 18.1586 60.5395 18.2647C60.5395 18.3708 60.5186 18.4759 60.478 18.574C60.4373 18.672 60.3778 18.7611 60.3027 18.8361L58.45 20.6878L60.3027 22.5394C60.3777 22.6144 60.4372 22.7035 60.4778 22.8016C60.5185 22.8996 60.5394 23.0047 60.5394 23.1108C60.5394 23.217 60.5185 23.3221 60.4778 23.4201C60.4372 23.5182 60.3777 23.6072 60.3027 23.6823C60.2276 23.7573 60.1385 23.8169 60.0405 23.8575C59.9424 23.8981 59.8373 23.919 59.7312 23.919C59.6251 23.919 59.52 23.8981 59.422 23.8575C59.3239 23.8169 59.2348 23.7573 59.1598 23.6823L56.7367 21.2592C56.6616 21.1842 56.602 21.0951 56.5614 20.9971C56.5207 20.899 56.4998 20.7939 56.4998 20.6878C56.4998 20.5816 56.5207 20.4765 56.5614 20.3785C56.602 20.2804 56.6616 20.1913 56.7367 20.1163L59.1598 17.6933C59.2348 17.6182 59.3239 17.5586 59.4219 17.5179C59.52 17.4773 59.6251 17.4564 59.7312 17.4564C59.8374 17.4564 59.9425 17.4773 60.0405 17.5179ZM71.0389 27.1493V14.2262C71.039 14.1201 71.0182 14.0151 70.9776 13.917C70.9371 13.819 70.8776 13.7299 70.8027 13.6548L65.1488 8.00094C65.0738 7.92596 64.9846 7.86651 64.8866 7.82597C64.7885 7.78543 64.6835 7.76461 64.5774 7.76469H54.8851C54.4566 7.76469 54.0458 7.93489 53.7428 8.23783C53.4399 8.54077 53.2697 8.95165 53.2697 9.38008V27.1493C53.2697 27.5777 53.4399 27.9886 53.7428 28.2916C54.0458 28.5945 54.4566 28.7647 54.8851 28.7647H69.4235C69.852 28.7647 70.2628 28.5945 70.5658 28.2916C70.8687 27.9886 71.0389 27.5777 71.0389 27.1493ZM69.4235 15.0339V27.1493H54.8851V9.38008H63.7697V14.2262C63.7697 14.4404 63.8548 14.6459 64.0062 14.7974C64.1577 14.9488 64.3632 15.0339 64.5774 15.0339H69.4235Z"
  
  // Reactive state for hover and animation
  const isHovered = ref(false)
  const rotationAngle = ref(0)
  
  // Computed style for arrow rotation - continuous rotation
  const arrowRotationStyle = computed(() => {
    return {
      transform: `rotate(${rotationAngle.value}deg)`,
      transformOrigin: 'center',
      transition: isHovered.value ? 'transform 0.2s linear' : 'transform 0.5s linear'
    }
  })
  
  // Event handlers for hover state
  function handleMouseEnter() {
    if (props.animate) {
      isHovered.value = true
    }
  }
  
  function handleMouseLeave() {
    if (props.animate) {
      isHovered.value = false
      
      // Don't reset rotation angle here to keep it continuous
      // This prevents the snapping back effect
    }
  }
  
  // Animation timers
  let colorCycleInterval = null
  let rotationInterval = null
  
  // Cycle the colors manually by manipulating the array directly
  function cycleColors() {
    // Make a copy of the current colors
    const colorsCopy = [...currentColors]
    
    // Shift every color position directly - ensuring ALL colors change
    for (let i = 0; i < colorPalette.length; i++) {
      // Move each color one position forward in the array (last one goes to first position)
      const nextIndex = (i + 1) % colorPalette.length
      currentColors[i] = colorsCopy[nextIndex]
    }
  }
  
  // Start color cycling animation
  function startColorCycle() {
    if (!props.animate) return
  
    // Clear any existing interval
    if (colorCycleInterval) {
      clearInterval(colorCycleInterval)
    }
    
    // Set up a new interval with appropriate speed
    colorCycleInterval = setInterval(() => {
      cycleColors()
      
      // Force a DOM update to ensure all colors refresh
      nextTick(() => {
        document.querySelectorAll('.file-item-group').forEach(group => {
          // A tiny DOM manipulation to force a repaint
          group.style.transform = group.style.transform.trim() + ' '
        })
      })
    }, isHovered.value ? 100 : 1000)
  }
  
  // Start rotation animation
  function startRotation() {
    if (!props.animate) return
  
    rotationInterval = setInterval(() => {
      // Increment rotation angle - continuous rotation
      rotationAngle.value = (rotationAngle.value + (isHovered.value ? 5 : 1)) % 360
    }, 50)
  }
  
  // Update animation speed when hover state changes
  function updateAnimationSpeed() {
    stopColorCycle()
    startColorCycle()
  }
  
  // Stop animations
  function stopColorCycle() {
    if (colorCycleInterval) {
      clearInterval(colorCycleInterval)
      colorCycleInterval = null
    }
  }
  
  function stopRotation() {
    if (rotationInterval) {
      clearInterval(rotationInterval)
      rotationInterval = null
    }
  }
  
  // Watch for hover state changes
  watch(isHovered, (newValue) => {
    updateAnimationSpeed()
    
    // Force a refresh on hover state change
    nextTick(() => {
      // Force a color cycle immediately when hover state changes
      cycleColors()
      cycleColors() // Do it twice to ensure a visible change
    })
  })
  
  onMounted(() => {
    startColorCycle()
    startRotation()
  })
  
  onBeforeUnmount(() => {
    stopColorCycle()
    stopRotation()
  })
  </script>
  
  <style scoped>
  .transfusion-logo {
    cursor: pointer;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
    transition: all 0.3s ease;
    position: relative;
  }
  
  .transfusion-logo:hover {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
    transform: scale(1.05);
  }
  
  /* File stacks positioning */
  .file-stack {
    position: relative;
  }
  
  /* File icon styling */
  .file-icon {
    transition: fill 0.3s ease !important;
    will-change: fill;
    fill-rule: evenodd !important;
    clip-rule: evenodd !important;
  }
  
  /* Window effect styling */
  .window-effect {
    transition: opacity 0.3s ease;
  }
  
  /* File item group */
  .file-item-group {
    position: relative;
  }
  
  /* Hover state - faster transitions */
  .logo-hover .file-icon {
    transition: fill 0.15s ease !important;
  }
  
  .logo-hover .window-effect {
    opacity: 0.3; /* Increase opacity slightly on hover */
  }
  
  /* Staggered transitions for rainbow effect */
  .file-item-group:nth-child(1) .file-icon { transition-delay: 0s; }
  .file-item-group:nth-child(2) .file-icon { transition-delay: 0.02s; }
  .file-item-group:nth-child(3) .file-icon { transition-delay: 0.04s; }
  .file-item-group:nth-child(4) .file-icon { transition-delay: 0.06s; }
  .file-item-group:nth-child(5) .file-icon { transition-delay: 0.08s; }
  .file-item-group:nth-child(6) .file-icon { transition-delay: 0.1s; }
  .file-item-group:nth-child(7) .file-icon { transition-delay: 0.12s; }
  
  /* Center arrows animation */
  .center-arrows {
    will-change: transform;
  }
  </style>