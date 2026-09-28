<script setup>
import MarketTicker from '@/components/MarketTicker.vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

// Initialize the store
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <!-- Master Wrapper: Stacks Navbar and Ticker -->
  <div class="w-full flex flex-col z-50 shadow-md">
    
    <!-- 1. The Navbar with Subtle Wave/Glow Background -->
    <div class="relative overflow-hidden w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-[#040811] border-b border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white transition-colors duration-200">
      
      <!-- Subtle Sine-Wave SVG Background Overlay -->
      <div class="sine-wave-bg absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" class="w-full h-full opacity-60">
          <path 
            d="M0,60 C180,100 360,20 540,60 C720,100 900,20 1080,60 C1260,100 1440,20 1620,60" 
            fill="none" 
            stroke="currentColor" 
            class="text-slate-300/30 dark:text-slate-700/30"
            stroke-width="1.5" 
          />
          <path 
            d="M0,70 C200,25 400,105 600,60 C800,15 1000,105 1200,60 C1400,15 1600,95 1800,60" 
            fill="none" 
            stroke="currentColor" 
            class="text-blue-500/20 dark:text-sky-400/25"
            stroke-width="1.5" 
          />
        </svg>
      </div>

      <!-- Glowing Wave Border Effect at Bottom -->
      <div class="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent pointer-events-none z-10"></div>

      <!-- Left Side: Clickable Logo -->
      <router-link to="/" class="relative z-10 font-bold text-xl tracking-wide flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
        <span class="text-blue-500">💎</span> BARCO HOLDINGS
      </router-link>

      <!-- 2. Right Side: Nav Links + Auth Actions Grouped Together -->
      <div class="relative z-10 flex items-center gap-6 md:gap-8">
        
        <!-- Nav Links -->
        <nav class="hidden md:flex items-center gap-6">
          <router-link 
            to="/#overview" 
            class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
          >
            Overview
          </router-link>
          
          <router-link 
            to="/#tiers" 
            class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
          >
            Tier Structure
          </router-link>
        </nav>

        <!-- Auth Actions -->
        <div>
          <!-- Real Authentication Check -->
          <template v-if="authStore.isAuthenticated">
            <router-link 
              to="/dashboard" 
              class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-900/20 uppercase"
            >
              Dashboard ({{ authStore.userTier }})
            </router-link>
          </template>
          
          <template v-else>
            <div class="flex items-center gap-4">
              <router-link to="/login" class="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Log in
              </router-link>
              <router-link to="/register" class="px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-500 hover:bg-blue-600/10 font-semibold text-sm transition-colors">
                Sign up
              </router-link>
            </div>
          </template>
        </div>

        <!-- Theme Toggle Button -->
        <button 
          @click="toggleTheme" 
          class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-semibold"
          title="Toggle Dark/Light Mode"
        >
          {{ isDark ? '🌙 Dark' : '☀️ Light' }}
        </button>

      </div>

    </div>

    <!-- 2. The Migrated Live Ticker -->
    <MarketTicker />
    
  </div>
</template>
