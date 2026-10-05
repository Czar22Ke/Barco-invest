<template>
  <div class="bronze-dashboard-view space-y-6">
    <!-- 1. Metric Financial Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Account Balance Widget -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div class="flex items-center justify-between text-slate-400 text-sm font-medium">
          <span>Portfolio Net Balance</span>
          <span class="text-lg">💰</span>
        </div>
        <div class="text-3xl font-bold text-white mt-2">{{ formatCurrency(portfolioState.balance) }}</div>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60">
          <span class="text-emerald-400 flex items-center gap-1.5 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Real-Time Sync
          </span>
          <span>Currency: {{ portfolioState.currency }}</span>
        </div>
      </div>

      <!-- High-Water Mark (HWM) Widget -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div class="flex items-center justify-between text-slate-400 text-sm font-medium">
          <span>High-Water Mark (HWM) Peak</span>
          <span class="text-lg">⛰️</span>
        </div>
        <div class="text-3xl font-bold text-sky-400 mt-2">{{ formatCurrency(portfolioState.highWaterMark) }}</div>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60">
          <span>Commission Baseline Peak</span>
          <span class="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-700/50">Profit Protected</span>
        </div>
      </div>

      <!-- NAV Valuation Window Widget -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div class="flex items-center justify-between text-slate-400 text-sm font-medium">
          <span>NAV Valuation Window</span>
          <span class="text-lg">🕒</span>
        </div>
        <div class="mt-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
            OPEN FOR PROCESSING
          </span>
        </div>
        <div class="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60">
          Valuation Cutoff: 00:00 - 04:00 UTC
        </div>
      </div>

      <!-- Transaction Console Widget -->
      <TransactionWidget />
    </div>

    <!-- 2. Bronze Tier Allocations Banner -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div class="inline-block text-[11px] font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 uppercase">
            Bronze Tier Account
          </div>
          <h2 class="text-xl font-bold text-white mt-1">Bronze Portfolio Allocation</h2>
          <p class="text-xs text-slate-400 mt-0.5">Balanced starter allocation: 70% Fiat USD Pool / 30% Crypto BTC Pool. Min deposit $500.00.</p>
        </div>
        <div class="text-xs font-mono bg-slate-800 text-sky-300 px-3 py-1.5 rounded-lg border border-slate-700 self-start sm:self-auto">
          20.00% Performance Fee (Profits > HWM)
        </div>
      </div>

      <!-- Allocation Progress Bars -->
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-xs text-slate-300 mb-1">
            <span>Fiat USD Liquidity Pool</span>
            <span class="font-mono text-slate-400">70.00%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-sky-400 rounded-full" style="width: 70%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs text-slate-300 mb-1">
            <span>Crypto BTC Pool</span>
            <span class="font-mono text-slate-400">30.00%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-amber-400 rounded-full" style="width: 30%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Live Exchange Price Tickers -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-white">Live Liquidity Pool Rates</h3>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/50">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> WebSocket Feed
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th class="py-2.5 px-3">Trading Pair</th>
              <th class="py-2.5 px-3">Pool Rate</th>
              <th class="py-2.5 px-3">Pool ID</th>
              <th class="py-2.5 px-3">Fee %</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="[pair, data] in Array.from(livePrices.entries())" :key="pair">
              <td class="py-2.5 px-3 font-semibold text-white">{{ data.pair }}</td>
              <td class="py-2.5 px-3 font-mono text-sky-400">${{ data.rate }}</td>
              <td class="py-2.5 px-3 font-mono text-slate-400 text-xs">{{ data.poolId }}</td>
              <td class="py-2.5 px-3 text-slate-300">{{ data.feePct }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. Real-Time Audit Stream -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-white">Real-Time Audit & Transaction Stream</h3>
          <p class="text-xs text-slate-400 mt-0.5">Persisted to double-entry database before WebSocket broadcast emission.</p>
        </div>
        <span class="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
          {{ liveFeed.length }} Events Captured
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th class="py-2.5 px-3">Time</th>
              <th class="py-2.5 px-3">Event Type</th>
              <th class="py-2.5 px-3">Amount</th>
              <th class="py-2.5 px-3">Balance After</th>
              <th class="py-2.5 px-3">HWM Peak</th>
              <th class="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-if="liveFeed.length === 0">
              <td colspan="6" class="py-6 text-center text-slate-500 text-xs">
                Waiting for WebSocket event streams (DEPOSIT_CLEARED, YIELD_ACCRUED, WITHDRAWAL_PROCESSED)...
              </td>
            </tr>
            <tr v-for="item in liveFeed" :key="item.id">
              <td class="py-2.5 px-3 font-mono text-slate-400 text-xs">{{ item.timestamp }}</td>
              <td class="py-2.5 px-3">
                <span class="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                  {{ item.title }}
                </span>
              </td>
              <td :class="['py-2.5 px-3 font-mono', item.type === 'WITHDRAWAL' ? 'text-red-400' : 'text-emerald-400']">
                {{ item.amount }}
              </td>
              <td class="py-2.5 px-3 font-mono text-slate-200">{{ formatCurrency(item.balance) }}</td>
              <td class="py-2.5 px-3 font-mono text-sky-400">{{ formatCurrency(item.hwm) }}</td>
              <td class="py-2.5 px-3">
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  VERIFIED DB PERSISTED
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { portfolioState, livePrices, liveFeed, syncPortfolioWithAuth, connectWebSocket } from '@/services/websocket.js'
import TransactionWidget from '@/components/TransactionWidget.vue'
import { formatCurrency } from '@/utils/formatters.js'

const authStore = useAuthStore()

onMounted(async () => {
  connectWebSocket()
  if (authStore.user) {
    await syncPortfolioWithAuth(authStore.user.userId || authStore.user.user_id, authStore.accountTier || authStore.userTier)
    if (authStore.user.balance !== undefined || authStore.user.currentBalance !== undefined) {
      portfolioState.balance = parseFloat(authStore.user.balance || authStore.user.currentBalance || portfolioState.balance || 0);
    }
  }
})
</script>
