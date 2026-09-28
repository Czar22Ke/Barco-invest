<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const handleLogout = () => {
  authStore.logout() // Clears Pinia state and localStorage
  router.push('/')   // Redirects to the public home page
}
</script>

<template>
  <div class="flex flex-col h-full w-[220px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200 font-sans select-none">
    
    <div class="flex-1 space-y-6 py-4 px-2">
      <!-- Menu Group -->
      <div>
        <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">Menu</h3>
        <nav class="flex flex-col gap-1">
          <router-link 
            to="/dashboard" 
            exact-active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="block w-full text-left px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-all duration-200"
          >
            Dashboard
          </router-link>
          <router-link 
            to="/dashboard/deposit" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="block w-full text-left px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-all duration-200"
          >
            Deposit
          </router-link>
          <router-link 
            to="/dashboard/transactions" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="block w-full text-left px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-all duration-200"
          >
            Transaction
          </router-link>
          <router-link 
            to="/dashboard/investment" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="block w-full text-left px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-all duration-200"
          >
            Investment
          </router-link>
          <router-link 
            to="/dashboard/plans" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="block w-full text-left px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-all duration-200"
          >
            Our Plans
          </router-link>
          <router-link 
            to="/dashboard/profile" 
            active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="block w-full text-left px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-all duration-200"
          >
            My Profile
          </router-link>
        </nav>
      </div>

      <!-- Additional Group -->
      <div>
        <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">Additional</h3>
        <nav class="flex flex-col gap-1">
          <router-link to="/" class="block w-full text-left px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-all duration-200">Go to Home</router-link>
        </nav>
      </div>
    </div>

    <!-- Pinned Bottom Section -->
    <div class="px-3 mt-auto pb-6 pt-4 border-t border-slate-200 dark:border-slate-800/60">
      <div class="flex flex-col gap-2">
        <!-- Theme Toggle Button -->
        <button 
          @click="toggleTheme" 
          class="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
        >
          <span>Theme</span>
          <span>{{ isDark ? '🌙 Dark' : '☀️ Light' }}</span>
        </button>

        <!-- Contact Link -->
        <button class="block w-full text-left px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-all duration-200">
          Contact
        </button>
        
        <!-- Active Sign Out Button -->
        <button 
          @click="handleLogout"
          class="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-all duration-200"
        >
          <span>Sign Out</span>
          <span class="text-lg leading-none">&rarr;</span>
        </button>
      </div>
    </div>

  </div>
</template>
