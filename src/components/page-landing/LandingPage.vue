<template>
  <div class="landing-page">
    
    <HeroSection />
    
    <section id="features" class="section-container">
      <FeaturesSection />
    </section>
    
    <HowItWorksSection />
    
    <CallToAction />
    
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <span class="logo-text">TransFusion</span>
            <p class="footer-tagline">Code Translation Reimagined</p>
          </div>
          
          <div class="footer-links">
            <div class="link-group">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#">Pricing</a>
            </div>
            
            <div class="link-group">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API</a>
              <a href="#">Blog</a>
            </div>
            
            <div class="link-group">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>© {{ new Date().getFullYear() }} TransFusion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from './HeroSection.vue'
import FeaturesSection from './FeaturesSection.vue'
import HowItWorksSection from './HowItWorksSection.vue'
import CallToAction from './CallToAction.vue'

const router = useRouter()
const isMobileMenuOpen = ref(false)

function startApp() {
  router.push('/setup')
}

function startAppMobile() {
  isMobileMenuOpen.value = false
  router.push('/setup')
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Prevent body scrolling when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.landing-page {
  font-family: 'Inter', sans-serif;
  color: #334155;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: white;
  background-color: transparent;
}

.nav-button {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.section-container {
  width: 100%;
}

.footer {
  background-color: #1a1a2e;
  color: white;
  padding: 4rem 2rem 2rem;
  width: 100%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-logo {
  flex: 1;
  min-width: 250px;
}

.footer-tagline {
  margin-top: 1rem;
  opacity: 0.7;
}

.footer-links {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
}

.link-group {
  min-width: 150px;
}

.link-group h4 {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.link-group a {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  margin-bottom: 0.8rem;
  transition: color 0.2s ease;
}

.link-group a:hover {
  color: white;
  background-color: transparent;
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  opacity: 0.6;
  font-size: 0.9rem;
}

/* Mobile Menu Styles */
.mobile-menu-button {
  display: none;
  cursor: pointer;
  color: white;
}

.mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1a1a2e;
  z-index: 99;
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  display: none;
}

.mobile-menu.active {
  transform: translateY(0);
  opacity: 1;
}

.mobile-menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 2rem;
  padding: 2rem;
}

.mobile-nav-link {
  color: white;
  font-size: 1.5rem;
  text-decoration: none;
  font-weight: 500;
}

.mobile-nav-button {
  padding: 1rem 2rem;
  width: 80%;
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }
  
  .nav {
    display: none;
  }
  
  .mobile-menu-button {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 2rem;
  }
  
  .footer-links {
    gap: 2rem;
  }
}
</style>