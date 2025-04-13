import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Import AnimXYZ styles
import '@animxyz/core'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

app.mount('#app')

// Add this to the end of your main.js file
document.addEventListener('DOMContentLoaded', () => {
    console.log('Simple scroll handler attached');
    
    // Add required CSS for header animations
    const style = document.createElement('style');
    style.textContent = `
      .app-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        width: 90%;
        max-width: 100%;
        transition: 
          width 0.3s ease-in-out, 
          left 0.3s ease-in-out, 
          max-width 0.3s ease-in-out,
          border-radius 0.3s ease-in-out,
          padding 0.3s ease-in-out;
      }
      
      .app-header.header-shrunk {
        max-width: 80% !important;
        width: 80% !important;
        left: 10% !important;
        border-radius: 0 0 20px 20px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
      }
    `;
    document.head.appendChild(style);
    
    // Get the header once
    const header = document.querySelector('.app-header');
    if (!header) {
      console.error('Header element not found');
      return;
    }
  
    // Simple flag to track state
    let headerShrunk = false;
    
    // Extremely simplified scroll handler
    function checkScroll() {
      // Get scroll position using multiple methods to ensure compatibility
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      // Debug - log actual scroll value
      console.log('Current scroll position:', scrollY);
      
      // Use a very simple comparison
      if (scrollY > 5) {
        if (!headerShrunk) {
          header.classList.add('header-shrunk');
          headerShrunk = true;
          console.log('Header shrunk added at scrollY:', scrollY);
        }
      } else {
        if (headerShrunk) {
          header.classList.remove('header-shrunk');
          headerShrunk = false;
          console.log('Header shrunk removed at scrollY:', scrollY);
        }
      }
    }
    
    // Check initial scroll position
    checkScroll();
    
    // Add multiple event listeners to catch all scroll events
    window.addEventListener('scroll', checkScroll);
    document.addEventListener('scroll', checkScroll);
    
    // Also check scroll position periodically as a failsafe
    setInterval(checkScroll, 1000);
  });