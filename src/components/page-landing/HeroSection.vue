
<template>
  <section class="hero">
    <div class="animation-background">
      <CodeTransformAnimation />
    </div>
    <div class="overlay"></div>
    
    <div class="container">
      <div class="hero-content">
        <h1 class="title">
          <AnimatedText class="gradient-text" :colors="['#4776E6', '#8E54E9']" :duration="5000">TransFusion</AnimatedText>
          <span class="subtitle">Code Translation Reimagined</span>
        </h1>
        <p class="description">
          Transform your codebase between frameworks with AI-powered precision.
          From React to Vue, Angular to Svelte - keep your logic, change your framework.
        </p>
        <div class="cta-buttons">
          <button class="primary-button" @click="startTranslation">
            Start Translation
          </button>
          <button class="secondary-button" @click="showDemo">
            See How It Works
          </button>
        </div>
      </div>
    </div>
    
    <div class="scroll-prompt" @click="scrollToFeatures">
      <div class="scroll-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14"></path>
          <path d="m19 12-7 7-7-7"></path>
        </svg>
      </div>
      <span>Scroll to learn more</span>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import CodeTransformAnimation from './CodeTransformAnimation.vue'
import { useRouter } from 'vue-router'
import AnimatedText from '../common/AnimatedText.vue'

const router = useRouter()

function startTranslation() {
  router.push('/setup')
}

function showDemo() {
  document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })
}

function scrollToFeatures() {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 2rem;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.animation-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  transform: scale(1.2);
  opacity: 0.5;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(26, 26, 46, 0.7);
  z-index: 2;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 3;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.subtitle {
  font-size: 1.8rem;
  font-weight: 400;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.gradient-text {
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  font-weight: 800;
}

.description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 1.5rem auto 2rem;
  max-width: 90%;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.primary-button, .secondary-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-button {
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  border: none;
  color: white;
}

.secondary-button {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.primary-button:hover, .secondary-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.primary-button:hover {
  box-shadow: 0 10px 20px rgba(71, 118, 230, 0.3);
}

.secondary-button:hover {
  border-color: rgba(255, 255, 255, 0.6);
}

.scroll-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  opacity: 0.7;
  animation: bounce 2s infinite;
  cursor: pointer;
  position: absolute;
  bottom: 30px;
  z-index: 3;
}

.scroll-icon {
  margin-bottom: 0.5rem;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.3rem;
  }
  
  .description {
    max-width: 100%;
    font-size: 1.1rem;
  }
  
  .animation-background {
    opacity: 0.3;
  }
}
</style>