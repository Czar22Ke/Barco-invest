<template>
  <div class="space-y-6 font-sans">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">Silver Portfolio Dashboard</h1>
      <span class="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-700/50 border border-slate-500/30 rounded-md">
        Silver Tier Account
      </span>
    </div>

    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
        <p class="text-xs text-slate-400 font-medium">Portfolio Net Balance</p>
        <p class="text-3xl font-extrabold text-white mt-2">{{ formatCurrency(portfolioState.balance || 12500) }}</p>
        <p class="text-xs text-green-400 mt-2">● Live Real-Time Sync | USD</p>
      </div>

      <div class="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
        <p class="text-xs text-slate-400 font-medium">High-Water Mark (HWM) Peak</p>
        <p class="text-3xl font-extrabold text-slate-200 mt-2">{{ formatCurrency(portfolioState.highWaterMark || 12500) }}</p>
        <span class="inline-block mt-2 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold">
          Standard Profit Protection
        </span>
      </div>

      <div class="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
        <p class="text-xs text-slate-400 font-medium">Yield Rate</p>
        <p class="text-3xl font-extrabold text-blue-400 mt-2">14.5% APY</p>
        <p class="text-xs text-slate-400 mt-2">Performance Fee: 18.00%</p>
      </div>
    </div>

    <!-- Silver Allocation Card -->
    <div class="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
      <h2 class="text-lg font-bold text-white">Silver Portfolio Allocation</h2>
      <p class="text-xs text-slate-400">Growth starter allocation: 60% Fiat USD Pool / 40% Crypto BTC Pool.</p>
      
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-xs font-medium mb-1">
            <span class="text-slate-300">Fiat USD Liquidity Pool</span>
            <span class="text-slate-400">60.00%</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="bg-blue-500 h-full w-[60%]"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs font-medium mb-1">
            <span class="text-slate-300">Crypto BTC Pool</span>
            <span class="text-slate-400">40.00%</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="bg-amber-500 h-full w-[40%]"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import { portfolioState, syncPortfolioWithAuth } from '@/services/websocket.js';
import { formatCurrency } from '@/utils/formatters.js';

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.user) {
    await syncPortfolioWithAuth(authStore.user.userId || authStore.user.user_id, authStore.accountTier || authStore.userTier);
    if (authStore.user.balance !== undefined || authStore.user.currentBalance !== undefined) {
      portfolioState.balance = parseFloat(authStore.user.balance || authStore.user.currentBalance || portfolioState.balance || 0);
    }
  }
});
</script>
