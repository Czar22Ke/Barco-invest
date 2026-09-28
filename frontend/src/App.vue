<template>
  <div class="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white min-h-screen transition-colors duration-200">
    <router-view />
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme';
useTheme();
</script>
