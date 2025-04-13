<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/common/AppHeader.vue'
</script>

<template>
  <div class="page-container">
    <AppHeader />
    <RouterView />
  </div>
</template>

<style>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Adjust for fixed header */
.page-container > * {
  padding-top: 80px;
}
</style>