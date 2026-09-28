<template>
  <header class="global-header relative overflow-hidden bg-white dark:bg-[#040811] border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
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

    <div class="header-container flex-between relative z-10">
      <div class="brand">
        <router-link to="/" class="brand-link text-slate-900 dark:text-white">
          <span class="brand-icon">💎</span>
          <span class="brand-name">BARCO <span class="highlight">HOLDINGS</span></span>
        </router-link>
      </div>
      <nav class="nav-links">
        <router-link to="/#overview" class="nav-link text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Overview</router-link>
        <router-link to="/#tiers" class="nav-link text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Tier Structure</router-link>
        
        <template v-if="authStore.isAuthenticated">
          <router-link to="/dashboard" class="btn-dashboard">
            Dashboard ({{ (authStore.accountTier || authStore.userTier || 'BRONZE').toUpperCase() }})
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Client Login</router-link>
          <router-link to="/register" class="btn-dashboard">Register Account</router-link>
        </template>

        <!-- Theme Toggle Button -->
        <button 
          @click="toggleTheme" 
          class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-semibold"
          title="Toggle Dark/Light Mode"
        >
          {{ isDark ? '🌙 Dark' : '☀️ Light' }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js';
import { useTheme } from '@/composables/useTheme.js';

const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();
</script>

<style scoped>
.global-header {
  height: 80px;
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  width: 100%;
}

.header-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
  color: #f8fafc;
  text-decoration: none;
}

.brand-icon { font-size: 1.5rem; }
.highlight { color: #38bdf8; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: #94a3b8;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.btn-dashboard {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff !important;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  transition: transform 0.2s;
}

.btn-dashboard:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 20px;
  }
  .nav-links {
    gap: 16px;
  }
  .nav-link {
    display: none;
  }
}
</style>
