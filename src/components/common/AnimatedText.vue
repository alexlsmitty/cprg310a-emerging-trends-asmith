<template>
    <span 
      class="animated-text"
      @mouseenter="onMouseEnter" 
      @mouseleave="onMouseLeave"
      :style="textStyle"
    >
      <slot></slot>
      <span class="underline" :class="{ 'active': isHovered }"></span>
    </span>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  
  const isHovered = ref(false);
  const colorIndex = ref(0);
  const textStyle = reactive({});
  
  const props = defineProps({
    colors: {
      type: Array,
      default: () => ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
    },
    duration: {
      type: Number,
      default: 3000
    }
  });
  
  function onMouseEnter() {
    isHovered.value = true;
  }
  
  function onMouseLeave() {
    isHovered.value = false;
  }
  
  function transitionColors() {
    textStyle.color = props.colors[colorIndex.value];
    colorIndex.value = (colorIndex.value + 1) % props.colors.length;
  }
  
  onMounted(() => {
    setInterval(transitionColors, props.duration);
  });
  </script>
  
  <style scoped>
  .animated-text {
    position: relative;
    display: inline-block;
  }
  
  .underline {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: currentColor;
    transition: width 0.5s ease-out;
  }
  
  .underline.active {
    width: 100%;
    transition-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  </style>