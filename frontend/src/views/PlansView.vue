<script setup>
import { ref } from 'vue';

const plans = ref([
  {
    name: 'Bronze',
    tier: 'BRONZE',
    rate: '8.00% APY',
    freq: 'Compounded Daily',
    min: '$500.00',
    fee: '20.00%',
    risk: 'Conservative',
    riskClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    color: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40',
    strategy: 'Balanced starter allocation: 70% Fiat USD Pool / 30% Crypto BTC Pool. Engineered for capital preservation with algorithmic yield harvesting.'
  },
  {
    name: 'Silver',
    tier: 'SILVER',
    rate: '10.00% APY',
    freq: 'Compounded Daily',
    min: '$1,000.00',
    fee: '15.00%',
    risk: 'Moderate',
    riskClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    color: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-slate-400/40 dark:hover:border-slate-500/40',
    strategy: 'Growth allocation: 60% Fiat USD Pool / 40% Crypto BTC Pool. Designed for steady capital appreciation and disciplined drawdown mitigation.'
  },
  {
    name: 'Gold',
    tier: 'GOLD',
    rate: '12.00% APY',
    freq: 'Compounded Daily',
    min: '$5,000.00',
    fee: '10.00%',
    risk: 'Dynamic Growth',
    riskClass: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-400 dark:border-yellow-800/60',
    badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-400 dark:border-yellow-800/60',
    color: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-yellow-500/40 dark:hover:border-yellow-500/40',
    strategy: 'High-yield allocation: 50% Fiat USD Pool / 50% Crypto BTC/ETH Pool. Dynamic quantitative rebalancing targeting superior risk-adjusted alpha.'
  },
  {
    name: 'Institutional',
    tier: 'INSTITUTIONAL',
    rate: '15.00% APY',
    freq: 'Compounded Daily',
    min: '$15,000.00',
    fee: '5.00%',
    risk: 'Prime Bespoke',
    riskClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60',
    color: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-purple-500/40 dark:hover:border-purple-500/40',
    popular: true,
    strategy: 'Bespoke prime institutional allocation: 40% Fiat USD / 60% Multi-Asset Pool. Multi-strategy market-neutral execution with maximum fee discount.'
  }
]);
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header Section -->
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Our Investment Plans</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1 max-w-3xl text-sm leading-relaxed">
        Review our structured investment tiers. Each allocation is engineered with distinct risk-reward profiles, dynamically managed to outpace market benchmarks.
      </p>
    </div>

    <!-- Responsive Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div 
        v-for="plan in plans" 
        :key="plan.tier"
        :class="[
          'bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative',
          plan.borderColor
        ]"
      >
        <!-- Top Details -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Tier Portfolio Plan
            </span>
            <!-- <span v-if="plan.popular" class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white tracking-wider">
              Prime
            </span> -->
          </div>

          <h3 :class="['text-2xl font-extrabold tracking-tight mb-2', plan.color]">
            {{ plan.name }}
          </h3>

          <div class="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {{ plan.rate }}
              </span>
            </div>
            <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {{ plan.freq }}
            </div>
          </div>

          <!-- Key Metrics -->
          <div class="space-y-3 mb-6 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 text-xs">Minimum Balance</span>
              <span class="font-bold font-mono text-slate-900 dark:text-white">{{ plan.min }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 text-xs">Performance Fee</span>
              <span class="font-bold font-mono text-slate-900 dark:text-white">{{ plan.fee }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 text-xs">Risk Profile</span>
              <span :class="['text-xs font-semibold px-2 py-0.5 rounded border', plan.riskClass]">
                {{ plan.risk }}
              </span>
            </div>
          </div>

          <!-- Strategy Overview -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 mb-6">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Strategy Overview
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ plan.strategy }}
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <router-link 
          to="/dashboard/investment"
          class="w-full text-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-colors shadow-sm dark:shadow-none flex items-center justify-center gap-2 group mt-auto"
        >
          <span>Allocate Capital</span>
          <svg class="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>
