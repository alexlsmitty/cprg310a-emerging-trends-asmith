<template>
  <section class="features-section">
    <div class="container">
      <h2 class="section-title">Why Choose TransFusion?</h2>
      
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index"
             :class="{ 'feature-highlight': feature.highlight }">
          <div class="feature-icon" v-html="feature.icon"></div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const features = ref([
  {
    title: 'Intelligent Analysis',
    description: 'Our system analyzes your codebase to understand dependencies and relationships between files before translation begins.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',
    highlight: true
  },
  {
    title: 'Contextual Translation',
    description: 'TransFusion maintains context between related components to ensure consistent translation patterns.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path></svg>'
  },
  {
    title: 'Framework-Specific Adaptation',
    description: 'Code is translated following the best practices and patterns of your target framework.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path></svg>'
  },
  {
    title: 'Chunked Processing',
    description: 'Large projects are processed in logical chunks to maintain code quality through complex translations.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="8" height="8" rx="2"></rect><rect x="14" y="2" width="8" height="8" rx="2"></rect><rect x="2" y="14" width="8" height="8" rx="2"></rect><rect x="14" y="14" width="8" height="8" rx="2"></rect></svg>'
  },
  {
    title: 'Detailed Reports',
    description: 'Receive comprehensive reports with adaptation explanations and potential issues highlighted.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>'
  },
  {
    title: 'Privacy-Focused',
    description: 'Your code never leaves your browser until translation - use your own API keys for maximum security.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    highlight: true
  }
])
</script>

<style scoped>
.features-section {
  padding: 5rem 2rem;
  background-color: #f7f9fc;
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
  color: #16213e;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.feature-highlight {
  /* Replace the thick gradient border with a thinner, more subtle one */
  border: 1px solid #4776E6;
  /* Add a subtle shadow with a hint of the gradient color */
  box-shadow: 0 3px 10px rgba(71, 118, 230, 0.1);
  /* Optional: Add a very subtle gradient background */
  background: linear-gradient(to bottom right, white, rgba(71, 118, 230, 0.05));
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-bottom: 1.5rem;
  color: #4776E6;
  background: rgba(71, 118, 230, 0.1);
  border-radius: 12px;
  padding: 12px;
}

.feature-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #16213e;
}

.feature-description {
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features-section {
    padding: 3rem 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
}
</style>