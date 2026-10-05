<template>
  <div class="space-y-6 font-sans">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">Gold Portfolio Dashboard</h1>
      <span class="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-md">
        Gold Tier Account
      </span>
    </div>

    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[#0f172a] p-5 rounded-2xl border border-amber-500/20">
        <p class="text-xs text-slate-400 font-medium">Portfolio Net Balance</p>
        <p class="text-3xl font-extrabold text-white mt-2">{{ formatCurrency(portfolioState.balance || 58200) }}</p>
        <p class="text-xs text-green-400 mt-2">● Priority Sync Active</p>
      </div>

      <div class="bg-[#0f172a] p-5 rounded-2xl border border-amber-500/20">
        <p class="text-xs text-slate-400 font-medium">High-Water Mark (HWM) Peak</p>
        <p class="text-3xl font-extrabold text-amber-400 mt-2">{{ formatCurrency(portfolioState.highWaterMark || 60000) }}</p>
        <span class="inline-block mt-2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
          Enhanced Shield
        </span>
      </div>

      <div class="bg-[#0f172a] p-5 rounded-2xl border border-amber-500/20">
        <p class="text-xs text-slate-400 font-medium">Yield Rate</p>
        <p class="text-3xl font-extrabold text-amber-400 mt-2">22.8% APY</p>
        <p class="text-xs text-slate-400 mt-2">Performance Fee: 15.00%</p>
      </div>
    </div>

    <!-- Gold Allocation Card -->
    <div class="bg-[#0f172a] p-6 rounded-2xl border border-amber-500/20 space-y-4">
      <h2 class="text-lg font-bold text-white">Gold Portfolio Allocation</h2>
      <p class="text-xs text-slate-400">High-yield multi-asset allocation: 50% Fiat / 30% Crypto / 20% Private Credit.</p>
      
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-xs font-medium mb-1">
            <span class="text-slate-300">Fiat USD Liquidity Pool</span>
            <span class="text-slate-400">50.00%</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="bg-blue-500 h-full w-[50%]"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs font-medium mb-1">
            <span class="text-slate-300">Crypto BTC/ETH Pool</span>
            <span class="text-slate-400">30.00%</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="bg-amber-500 h-full w-[30%]"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs font-medium mb-1">
            <span class="text-slate-300">Private Credit Vault</span>
            <span class="text-slate-400">20.00%</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full w-[20%]"></div>
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
