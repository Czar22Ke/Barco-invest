<script setup>
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <!-- Main page wrapper: Add light mode background and text defaults, prefix darks -->
  <div class="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-white transition-colors duration-200">
    
    <!-- Pinned Public Header -->
    <header class="sticky top-0 w-full z-50">
      <GlobalHeader />
    </header>

    <!-- 1. Hero Overview Section -->
    <section id="overview" class="relative pt-20 pb-28 flex flex-col items-center justify-center text-center px-4">
      
      <!-- Institutional Grade Badge -->
      <div class="inline-block mb-6 px-4 py-1.5 rounded-full border border-slate-300 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 text-xs font-bold tracking-wider text-slate-700 dark:text-slate-300 transition-colors">
        INSTITUTIONAL GRADE PLATFORM
      </div>
      
      <!-- Hero Title -->
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl text-slate-900 dark:text-white transition-colors">
        High-Precision Portfolio & <span class="text-blue-600 dark:text-sky-400">Yield Management</span>
      </h1>
      
      <!-- Hero Subtitle -->
      <p class="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 transition-colors">
        Decoupled Node.js microservices with High-Water Mark (HWM) profit tracking, NAV valuation window processing, and real-time WebSocket event broadcasting.
      </p>
      
      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <router-link 
          :to="authStore.isAuthenticated ? '/dashboard' : '/login'" 
          class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
        >
          Launch Client Dashboard
        </router-link>
        
        <!-- Secondary Button: Update to swap from light gray to dark translucent -->
        <a 
          href="#tiers" 
          class="px-8 py-4 bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 font-bold rounded-lg transition-colors"
        >
          View Tier Allocations
        </a>
      </div>
    </section>

    <!-- 2. Statistical Data Banner Section -->
    <section class="py-16 border-t border-b border-slate-200 dark:border-sky-500/20 bg-slate-100/70 dark:bg-[#090d16] transition-colors duration-200">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-sky-400 font-mono">$50M+</span>
            <span class="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mt-2">Institutional Liquidity Depth</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-sky-400 font-mono">100%</span>
            <span class="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mt-2">HWM Profit Isolation Accuracy</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-sky-400 font-mono">&lt; 10ms</span>
            <span class="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mt-2">WebSocket Latency Sync</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Stark White / Dark Informational Section: Institutional Tier Allocations -->
    <section id="tiers" class="py-20 px-4 max-w-7xl mx-auto transition-colors duration-200">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Institutional Tier Allocations</h2>
        <p class="text-slate-600 dark:text-slate-400 text-base md:text-lg">
          Dynamically managed fund allocations with isolated performance fees and tax withholdings.
        </p>
      </div>

      <!-- Monochromatic Blue Progression Tier Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        
        <!-- Card 1: Bronze Tier -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col transition-colors">
          <div class="pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
            <h3 class="text-xl font-bold mb-2 uppercase text-slate-900 dark:text-white">Bronze</h3>
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">$500.00</span>
              <span class="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">min deposit</span>
            </div>
            <div class="text-xs font-semibold text-blue-600 dark:text-sky-400 uppercase tracking-wider mt-1">Starter Tier</div>
          </div>
          <ul class="space-y-3.5 mb-8 text-sm text-slate-600 dark:text-slate-300 list-none p-0">
            <li><strong class="text-slate-900 dark:text-white font-bold">70%</strong> Fiat / <strong class="text-slate-900 dark:text-white font-bold">30%</strong> Crypto BTC</li>
            <li><strong class="text-slate-900 dark:text-white font-bold">20.00%</strong> Performance Fee (Profits &gt; HWM)</li>
            <li><strong class="text-slate-900 dark:text-white font-bold">5.00%</strong> Tax Withholding</li>
            <li>Standard Portfolio Analytics</li>
          </ul>
          <router-link 
            :to="authStore.isAuthenticated ? '/dashboard/upgrade' : '/register?tier=bronze'" 
            class="mt-auto w-full block text-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors whitespace-nowrap"
          >
            Select Bronze Tier
          </router-link>
        </div>

        <!-- Card 2: Silver Tier -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col transition-colors">
          <div class="pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
            <h3 class="text-xl font-bold mb-2 uppercase text-slate-900 dark:text-white">Silver</h3>
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">$1,000.00</span>
              <span class="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">min deposit</span>
            </div>
            <div class="text-xs font-semibold text-blue-600 dark:text-sky-400 uppercase tracking-wider mt-1">Mid-Tier Growth</div>
          </div>
          <ul class="space-y-3.5 mb-8 text-sm text-slate-600 dark:text-slate-300 list-none p-0">
            <li><strong class="text-slate-900 dark:text-white font-bold">60%</strong> Fiat / <strong class="text-slate-900 dark:text-white font-bold">40%</strong> Crypto BTC</li>
            <li>Enhanced Portfolio Analytics</li>
            <li><strong class="text-slate-900 dark:text-white font-bold">18.00%</strong> Performance Fee (Profits &gt; HWM)</li>
            <li><strong class="text-slate-900 dark:text-white font-bold">5.00%</strong> Tax Withholding</li>
          </ul>
          <router-link 
            :to="authStore.isAuthenticated ? '/dashboard/upgrade' : '/register?tier=silver'" 
            class="mt-auto w-full block text-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors whitespace-nowrap"
          >
            Select Silver Tier
          </router-link>
        </div>

        <!-- Card 3: Gold Tier -->
        <div class="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col transition-colors">
          <div class="pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
            <h3 class="text-xl font-bold mb-2 uppercase text-amber-600 dark:text-amber-400">Gold</h3>
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">$5,000.00</span>
              <span class="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">min deposit</span>
            </div>
            <div class="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-1">High-Net-Worth Tier</div>
          </div>
          <ul class="space-y-3.5 mb-8 text-sm text-slate-600 dark:text-slate-300 list-none p-0">
            <li>Custom Pool Allocation</li>
            <li>Priority Execution Engine</li>
            <li><strong class="text-slate-900 dark:text-white font-bold">15.00%</strong> Performance Fee (Profits &gt; HWM)</li>
            <li><strong class="text-slate-900 dark:text-white font-bold">5.00%</strong> Tax Withholding</li>
          </ul>
          <router-link 
            :to="authStore.isAuthenticated ? '/dashboard/upgrade' : '/register?tier=gold'" 
            class="mt-auto w-full block text-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors whitespace-nowrap"
          >
            Select Gold Tier
          </router-link>
        </div>

        <!-- Card 4: Institutional Tier -->
        <div class="bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-sky-400 rounded-2xl p-6 md:p-8 shadow-lg flex flex-col transition-colors relative">
          <div class="pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-bold uppercase text-blue-600 dark:text-sky-400">Institutional</h3>
              <span class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-sky-300">Enterprise</span>
            </div>
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">$15,000.00</span>
              <span class="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">min deposit</span>
            </div>
            <div class="text-xs font-semibold text-blue-600 dark:text-sky-400 uppercase tracking-wider mt-1">Enterprise Tier</div>
          </div>
          <ul class="space-y-3.5 mb-8 text-sm text-slate-600 dark:text-slate-300 list-none p-0">
            <li>Direct OTC Liquidity Desk</li>
            <li>Dedicated Account Manager</li>
            <li>Custom Valuation Cutoffs</li>
            <li><strong class="text-slate-900 dark:text-white font-bold">10.00%</strong> Institutional Performance Fee</li>
          </ul>
          <router-link 
            :to="authStore.isAuthenticated ? '/dashboard/upgrade' : '/register?tier=institutional'" 
            class="mt-auto w-full block text-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors whitespace-nowrap shadow-md shadow-blue-500/20"
          >
            Select Institutional Tier
          </router-link>
        </div>

      </div>
    </section>

    <!-- Public Footer -->
    <GlobalFooter class="flex-none mt-auto" />

  </div>
</template>
