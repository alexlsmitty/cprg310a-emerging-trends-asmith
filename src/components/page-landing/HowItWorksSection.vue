<template>
  <section class="how-it-works" id="how-it-works">
    <div class="container">
      <h2 class="section-title">How TransFusion Works</h2>
      
      <div class="step-visual">
        <div class="visual-container">
          <div class="step-info">
            <h3 class="step-title">{{ steps[currentStep].title }}</h3>
          </div>
          
          <transition name="fade" mode="out-in">
            <div :key="currentStep" class="visual-content">
              <!-- Import and use different animation components based on currentStep -->
              <StepOne v-if="currentStep === 0" />
              <StepTwo v-else-if="currentStep === 1" />
              <StepThree v-else-if="currentStep === 2" />
              <StepFour v-else-if="currentStep === 3" />
              <StepFive v-else-if="currentStep === 4" />
              <!-- Future animations will go here -->
              <div v-else class="placeholder-animation">
                <img :src="steps[currentStep].image" :alt="steps[currentStep].title" class="step-image">
              </div>
            </div>
          </transition>
          
          <div class="step-description">
            <p>{{ steps[currentStep].description }}</p>
          </div>
        </div>
        
        <div class="step-controls">
          <button @click="prevStep" :disabled="currentStep === 0" class="step-btn">
            Previous
          </button>
          <div class="step-dots">
            <span v-for="(step, index) in steps" :key="index" 
                  @click="currentStep = index"
                  :class="{ 'active': currentStep === index }"
                  class="step-dot"></span>
          </div>
          <button @click="nextStep" :disabled="currentStep === steps.length - 1" class="step-btn">
            Next
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import StepOne from './animation-components/StepOne.vue';
import StepTwo from './animation-components/StepTwo.vue';
import StepThree from './animation-components/StepThree.vue';
import StepFour from './animation-components/StepFour.vue';
import StepFive from './animation-components/StepFive.vue'; // Future animation component

const currentStep = ref(0);

// Updated steps with better descriptions
const steps = ref([
  {
    title: 'Select Your Frameworks',
    description: 'Choose the source framework of your current code and the target framework you want to translate to. TransFusion supports React, Vue, Angular, Svelte, and more.',
    image: '/api/placeholder/600/400' // Fallback image if animation fails
  },
  {
    title: 'Upload Your Code',
    description: 'Upload your project files by dragging and dropping them or using the file selector. TransFusion will automatically identify and organize relevant files for translation.',
    image: '/api/placeholder/600/400'
  },
  {
    title: 'Review Analysis',
    description: 'Our system intelligently scans your code to understand components, dependencies, and framework-specific patterns before beginning the translation process.',
    image: '/api/placeholder/600/400'
  },
  {
    title: 'Translation Processing',
    description: 'TransFusion processes your code in logical chunks, preserving context between related components while adapting to your target frameworks patterns and best practices.',
    image: '/api/placeholder/600/400'
  },
  {
    title: 'Get Results',
    description: 'Receive your translated codebase along with detailed reports highlighting the adaptations made, potential issues, and recommendations for further optimization.',
    image: '/api/placeholder/600/400'
  }
]);

function nextStep() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}
</script>

<style scoped>
.how-it-works {
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
  color: white;
  width: 100%;
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: white;
}

.step-visual {
  margin-top: 3rem;
}

.visual-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
}

.step-info {
  margin-bottom: 1.5rem;
  text-align: center;
}

.step-title {
  font-size: 1.8rem;
  color: white;
  font-weight: 600;
}

.visual-content {
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

.placeholder-animation {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.step-description {
  text-align: center;
  max-width: 800px;
  margin-top: 1.5rem;
  opacity: 0.8;
  line-height: 1.6;
}

.step-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-btn {
  padding: 0.8rem 1.5rem;
  background: rgba(71, 118, 230, 0.2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-weight: 600;
}

.step-btn:hover:not(:disabled) {
  background: rgba(71, 118, 230, 0.4);
}

.step-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-dots {
  display: flex;
  gap: 0.5rem;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.step-dot.active {
  background: #4776E6;
  transform: scale(1.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .how-it-works {
    padding: 3rem 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .visual-container {
    min-height: 450px;
  }
  
  .step-title {
    font-size: 1.4rem;
  }
  
  .visual-content {
    height: 300px;
  }
  
  .step-description {
    font-size: 0.9rem;
  }
  
  .step-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .step-dots {
    gap: 0.3rem;
  }
  
  .step-dot {
    width: 10px;
    height: 10px;
  }
}
</style>