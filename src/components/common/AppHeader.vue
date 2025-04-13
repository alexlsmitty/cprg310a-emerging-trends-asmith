<template>
  <header 
    ref="headerRef"
    class="app-header" 
    :class="headerClasses"
  >
    <div class="container">
      <div class="logo">
        <RouterLink to="/" class="logo-link">
          <!-- Animated Logo Component -->
          <AnimatedLogo class="logo-icon" :animate="true" />
          
          <!-- Animated Logo Text -->
          <div 
            class="logo-text-container"
            @mouseenter="handleTextHover(true)"
            @mouseleave="handleTextHover(false)"
          >
            <div class="logo-text" :class="{ 'text-hover': isTextHovered }">
              <div class="text-gradient" ref="textGradient">TransFusion</div>
            </div>
          </div>
        </RouterLink>
      </div>
      
      <nav class="nav">
        <template v-if="isLandingPage">
          <a href="#features" class="nav-link">Features</a>
          <a href="#how-it-works" class="nav-link">How It Works</a>
          
          <div class="dropdown">
            <button 
              class="nav-link dropdown-toggle" 
              @click="toggleResourcesDropdown"
            >
              Resources
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            
            <div 
              v-if="isResourcesDropdownOpen" 
              class="dropdown-menu"
              @mouseleave="closeResourcesDropdown"
            >
              <a href="#" class="dropdown-item">Documentation</a>
              <a href="#" class="dropdown-item">Blog</a>
              <a href="#" class="dropdown-item">API</a>
              <a href="#" class="dropdown-item">Pricing</a>
            </div>
          </div>
          
          <button class="nav-button" @click="startApp">Get Started</button>
        </template>
        
        <template v-else>
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          
          <div class="dropdown">
            <button 
              class="nav-link dropdown-toggle" 
              @click="toggleResourcesDropdown"
            >
              Resources
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            
            <div 
              v-if="isResourcesDropdownOpen" 
              class="dropdown-menu"
              @mouseleave="closeResourcesDropdown"
            >
              <a href="#" class="dropdown-item">Documentation</a>
              <a href="#" class="dropdown-item">Blog</a>
              <a href="#" class="dropdown-item">API</a>
              <a href="#" class="dropdown-item">Pricing</a>
            </div>
          </div>
          
          <RouterLink to="/docs" class="nav-link">Docs</RouterLink>
        </template>
      </nav>
      
      <div class="user-profile">
        <button 
          class="profile-button" 
          @click="goToProfile"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AnimatedLogo from '../icons/animated-icons/AnimatedLogo.vue'; // Update with the correct path

const router = useRouter();
const route = useRoute();

const headerRef = ref(null);
const textGradient = ref(null);
const scrollPosition = ref(0);
const isResourcesDropdownOpen = ref(false);
const isTextHovered = ref(false);
const gradientPosition = ref(0);

// Reactive tracking of scroll state
const isScrolled = ref(false);

// Colors for text gradient animation (same as logo for consistency)
const colorPalette = [
  '#FF6B6B',  // Coral Red
  '#FF9F1C',  // Warm Orange
  '#2EC4B6',  // Teal
  '#4776E6',  // Vibrant Blue
  '#8E54E9',  // Soft Purple
  '#6A4C93',  // Deep Purple
  '#1982C4',  // Bright Blue
];

// Animation frame ID for smoother animation
let animationFrameId = null;

// Determine if we're on the landing page
const isLandingPage = computed(() => route.path === '/');

// Compute header classes dynamically
const headerClasses = computed(() => ({
  'landing-page': isLandingPage.value,
  'header-shrunk': isScrolled.value && isLandingPage.value
}));

function handleScroll() {
  // Throttle scroll events
  if (performance.now() - lastScrollTime.value < 50) return;
  
  const currentScrollPosition = 
    window.pageYOffset || 
    document.documentElement.scrollTop || 
    document.body.scrollTop;
  
  // Update scroll state
  isScrolled.value = currentScrollPosition > 50;
  scrollPosition.value = currentScrollPosition;
  
  // Update last scroll time
  lastScrollTime.value = performance.now();
}

// Throttling mechanism
const lastScrollTime = ref(0);

function toggleResourcesDropdown() {
  isResourcesDropdownOpen.value = !isResourcesDropdownOpen.value;
}

function closeResourcesDropdown() {
  isResourcesDropdownOpen.value = false;
}

function startApp() {
  router.push('/setup');
}

function goToProfile() {
  router.push('/profile');
}

// Text hover handler
function handleTextHover(isHovered) {
  isTextHovered.value = isHovered;
}

// Function to animate the gradient using requestAnimationFrame for smoother motion
function animateGradient(timestamp) {
  if (!textGradient.value) return;
  
  // Calculate the step size based on hover state - smoother values
  const step = isTextHovered.value ? 0.5 : 0.05;
  
  // Update gradient position with smoother increment
  gradientPosition.value = (gradientPosition.value + step) % 100;
  
  // Apply the position with CSS custom property for smoother animation
  textGradient.value.style.setProperty('--gradient-position', `${gradientPosition.value}%`);
  
  // Continue the animation loop
  animationFrameId = requestAnimationFrame(animateGradient);
}

// Generate gradient background with improved color distribution
function generateGradient() {
  // Create a smoother, longer gradient
  let gradientStr = 'linear-gradient(to right, ';
  const segments = 5; // How many times to repeat the palette
  
  for (let s = 0; s < segments; s++) {
    colorPalette.forEach((color, i) => {
      // Calculate percentage positions for smoother transitions
      const position = (i + s * colorPalette.length) * (100 / (colorPalette.length * segments));
      gradientStr += `${color} ${position}%, `;
      
      // Add midpoint color stops for smoother transitions between colors
      const nextColor = colorPalette[(i + 1) % colorPalette.length];
      const midPosition = position + (100 / (colorPalette.length * segments)) / 2;
      
      // Create a blend between the colors
      if (s < segments - 1 || i < colorPalette.length - 1) {
        gradientStr += `${color} ${position + 2}%, ${nextColor} ${midPosition + 2}%, `;
      }
    });
  }
  
  // Add the last color to complete the gradient
  gradientStr += `${colorPalette[0]} 100%)`;
  
  return gradientStr;
}

onMounted(() => {
  // Multiple scroll event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('scroll', handleScroll, { passive: true });
  
  // Initial check
  handleScroll();
  
  // Initialize gradient
  if (textGradient.value) {
    const gradient = generateGradient();
    textGradient.value.style.backgroundImage = gradient;
    
    // Start animation with requestAnimationFrame for smoother performance
    animationFrameId = requestAnimationFrame(animateGradient);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('scroll', handleScroll);
  
  // Ensure animation cleanup
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>  

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  transition: 
    width 0.3s ease-in-out, 
    left 0.3s ease-in-out, 
    padding 0.3s ease-in-out, 
    border-radius 0.3s ease-in-out,
    max-width 0.3s ease-in-out;
  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
}

.app-header.landing-page.header-shrunk {
  padding: 0.5rem 1rem;
  border-radius: 0 0 20px 20px; /* Rounded bottom corners when scrolled */
  max-width: 80%; /* Shrink to 80% of the window */
  width: 80%; /* Ensure width matches max-width */
  left: 10%; /* Center the header */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo styling */
.logo {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 0.5rem;
}

.logo-icon {
  height: 44px;
  width: 84px;
}

.logo-text-container {
  height: 44px;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
}

/* Improved text gradient styling for smoother animations */
.text-gradient {
  --gradient-position: 0%;
  display: inline-block;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 500% 100%;
  will-change: background-position;
  background-position: var(--gradient-position) 0;
  font-weight: 800;
  padding-right: 0.5rem;
  transition: opacity 0.3s ease;
  opacity: 0.7; /* Lighter by default */
}

/* Hover effect for text */
.text-hover .text-gradient {
  opacity: 1; /* Full opacity on hover */
}

/* Navigation styling */
.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: white;
  background-color: transparent;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #1e293b;
  border-radius: 8px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  min-width: 180px;
  margin-top: 0.5rem;
  overflow: hidden;
  z-index: 5;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
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

.user-profile {
  display: flex;
  align-items: center;
}

.profile-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s ease, transform 0.2s ease;
}

.profile-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem 1rem;
  }
  
  .app-header.landing-page.header-shrunk {
    max-width: 95%;
    width: 95%;
    left: 2.5%;
  }
  
  .logo-text {
    font-size: 1.2rem;
  }
  
  .nav {
    gap: 1rem;
  }
  
  .nav-link {
    font-size: 0.9rem;
  }
  
  .nav-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>