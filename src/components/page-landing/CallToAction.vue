<template>
  <section class="cta-section">
    <div class="cta-bg-pattern"></div>
    <div class="container">
      <div class="cta-content">
        <h2 class="cta-title">Ready to Transform Your Codebase?</h2>
        <p class="cta-description">
          Start translating your code between frameworks today with TransFusion's powerful AI-driven approach.
        </p>
        <button class="cta-button" @click="startNow">Start For Free</button>
      </div>
      
      <div class="frameworks-display">
        <div class="framework" v-for="(framework, index) in frameworks" :key="index">
          <div class="framework-logo">
            <component :is="framework.icon" />
          </div>
          <span class="framework-name">{{ framework.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FrameworkIconReact from '../icons/FrameworkIconReact.vue'
import FrameworkIconVue from '../icons/FrameworkIconVue.vue'
import FrameworkIconAngular from '../icons/FrameworkIconAngular.vue'
import FrameworkIconSvelte from '../icons/FrameworkIconSvelte.vue'
import FrameworkIconNextjs from '../icons/FrameworkIconNextJs.vue'
import FrameworkIconNuxt from '../icons/FrameworkIconNuxt.vue'

const router = useRouter()

function startNow() {
  router.push('/setup')
}

const frameworks = ref([
  {
    name: 'React',
    icon: FrameworkIconReact
  },
  {
    name: 'Vue',
    icon: FrameworkIconVue
  },
  {
    name: 'Angular',
    icon: FrameworkIconAngular
  },
  {
    name: 'Svelte',
    icon: FrameworkIconSvelte
  },
  {
    name: 'Next.js',
    icon: FrameworkIconNextjs
  },
  {
    name: 'Nuxt',
    icon: FrameworkIconNuxt
  }
])
</script>

<style scoped>
.cta-section {
  padding: 7rem 2rem;
  background: linear-gradient(135deg, #f7f9fc 0%, #e9f0f9 100%);
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.cta-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(71, 118, 230, 0.1) 2px, transparent 2px);
  background-size: 30px 30px;
  opacity: 0.5;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
}

.cta-content {
  max-width: 800px;
  margin-bottom: 3rem;
}

.cta-title {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #16213e, #4776E6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.cta-description {
  font-size: 1.3rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.cta-button {
  padding: 1.2rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 10px 20px rgba(71, 118, 230, 0.3);
}

.cta-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(71, 118, 230, 0.4);
}

.frameworks-display {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  justify-content: center;
  margin-top: 3rem;
}

.framework {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  opacity: 0.7;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.framework:hover {
  opacity: 1;
  transform: translateY(-5px);
}

.framework-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.framework-logo:hover {
  transform: scale(1.05);
}

.framework-name {
  font-size: 1rem;
  font-weight: 500;
  color: #475569;
}

@media (max-width: 768px) {
  .cta-section {
    padding: 4rem 1.5rem;
  }
  
  .cta-title {
    font-size: 2.2rem;
  }
  
  .cta-description {
    font-size: 1.1rem;
  }
  
  .cta-button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    width: 100%;
    max-width: 300px;
  }
  
  .frameworks-display {
    gap: 1.5rem;
  }
  
  .framework-logo {
    width: 60px;
    height: 60px;
  }
  
  .framework {
    width: 80px;
  }
  
  .framework-name {
    font-size: 0.9rem;
  }
}
</style>