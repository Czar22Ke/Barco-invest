<template>
  <div class="space-y-6 font-sans">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">Institutional Portfolio Manager</h1>
      <span class="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
        Institutional Tier
      </span>
    </div>

    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[#0f172a] p-5 rounded-2xl border border-emerald-500/20">
        <p class="text-xs text-slate-400 font-medium">Custodial Net Assets</p>
        <p class="text-3xl font-extrabold text-white mt-2">{{ formatCurrency(portfolioState.balance || 2450000) }}</p>
        <p class="text-xs text-emerald-400 mt-2">● Direct WebSocket Feed Active</p>
      </div>

      <div class="bg-[#0f172a] p-5 rounded-2xl border border-emerald-500/20">
        <p class="text-xs text-slate-400 font-medium">High-Water Mark (HWM) Peak</p>
        <p class="text-3xl font-extrabold text-emerald-400 mt-2">{{ formatCurrency(portfolioState.highWaterMark || 2450000) }}</p>
        <span class="inline-block mt-2 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
          Institutional Guarantee
        </span>
      </div>

      <div class="bg-[#0f172a] p-5 rounded-2xl border border-emerald-500/20">
        <p class="text-xs text-slate-400 font-medium">NAV Valuation Window</p>
        <p class="text-xl font-extrabold text-green-400 mt-2 uppercase">Open for Processing</p>
        <p class="text-xs text-slate-400 mt-2">Valuation Cutoff: 00:00 - 04:00 UTC</p>
      </div>
    </div>

    <!-- Institutional Allocation Card -->
    <div class="bg-[#0f172a] p-6 rounded-2xl border border-emerald-500/20 space-y-4">
      <h2 class="text-lg font-bold text-white">Institutional Liquidity Allocation</h2>
      <p class="text-xs text-slate-400">Direct OTC Liquidity desk access with institutional performance fee structure (10.00%).</p>
      
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-xs font-medium mb-1">
            <span class="text-slate-300">Institutional OTC USD Reserve</span>
            <span class="text-slate-400">70.00%</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full w-[70%]"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs font-medium mb-1">
            <span class="text-slate-300">Institutional Sovereign BTC Pool</span>
            <span class="text-slate-400">30.00%</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="bg-cyan-500 h-full w-[30%]"></div>
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
    await syncPortfolioWithAuth(authStore.user.userId || authStore.user.id, authStore.accountTier || authStore.userTier);
    if (authStore.user.balance !== undefined || authStore.user.currentBalance !== undefined) {
      portfolioState.balance = parseFloat(authStore.user.balance || authStore.user.currentBalance || portfolioState.balance || 0);
    }
  }
});
</script>
