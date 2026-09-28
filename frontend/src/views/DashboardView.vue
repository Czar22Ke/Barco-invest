<template>
  <div class="dashboard-view space-y-6">
    <!-- Rejection Alert Banner -->
    <div v-if="hasRejectedWithdrawals" class="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6 flex items-start justify-between gap-4 transition-colors">
      <div class="flex items-start gap-4">
        <div class="text-rose-500 text-xl mt-0.5">⚠️</div>
        <div>
          <h4 class="text-rose-700 dark:text-rose-400 font-bold text-sm">Withdrawal Declined</h4>
          <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">
            One or more of your recent withdrawal requests has been rejected by our compliance team. Please use the Support & Suggestions widget below to contact an administrator for assistance.
          </p>
        </div>
      </div>
      <button @click="dismissBanner" class="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors p-1" title="Dismiss">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Header with Dynamic Tier -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">DASHBOARD (<span :class="tierColor">{{ userTier }}</span>)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Target Return: <span class="font-semibold text-emerald-500 dark:text-emerald-400">{{ targetApy }} APY</span> &bull; Minimum Deposit: <span class="font-semibold text-slate-700 dark:text-slate-200">{{ minBalance }}</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span :class="['inline-block text-[11px] font-bold tracking-wider px-2.5 py-1 rounded border uppercase', currentConfig.badgeBg]">
          {{ userTier }} TIER ACCOUNT
        </span>
      </div>
    </div>

    <!-- 1. Metric Financial Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <!-- Account Balance Widget -->
      <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-200">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-medium">
          <span>Portfolio Net Balance</span>
          <span class="text-lg">💰</span>
        </div>
        <p class="text-3xl font-bold text-slate-900 dark:text-white font-mono mt-2">
          {{ formatCurrency(currentBalance) }}
        </p>
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60">
          <span class="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> Live Real-Time Sync
          </span>
          <span>Currency: {{ portfolioState.currency }}</span>
        </div>
      </div>

      <!-- High-Water Mark (HWM) Widget -->
      <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-200">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-medium">
          <span>High-Water Mark (HWM) Peak</span>
          <span class="text-lg">⛰️</span>
        </div>
        <p class="text-3xl font-bold text-sky-500 font-mono mt-2">
          {{ formatCurrency(hwmPeak) }}
        </p>
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60">
          <span>Commission Baseline Peak</span>
          <span class="bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-200 dark:border-blue-700/50">Profit Protected</span>
        </div>
      </div>

      <!-- Target APY Widget -->
      <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-200">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-medium">
          <span>Target Yield Rate</span>
          <span class="text-lg">📈</span>
        </div>
        <div :class="['text-3xl font-bold mt-2', tierColor]">{{ targetApy }}</div>
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60">
          <span>Daily Compounding</span>
          <span class="text-emerald-500 dark:text-emerald-400 font-medium">Target APY</span>
        </div>
      </div>

      <!-- Minimum Balance Requirement Widget -->
      <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-200">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-medium">
          <span>Minimum Balance</span>
          <span class="text-lg">🛡️</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white mt-2">{{ minBalance }}</div>
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60">
          <span>Tier Threshold</span>
          <span class="font-mono text-slate-600 dark:text-slate-300 text-[11px]">{{ currentConfig.feePct }} Perf Fee</span>
        </div>
      </div>
    </div>

    <!-- 2. Operations Row: NAV Window & Transaction Widget -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- NAV Valuation Window Widget -->
      <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-200 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-medium">
            <span>NAV Valuation Window</span>
            <span class="text-lg">🕒</span>
          </div>
          <div class="mt-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700/50">
              OPEN FOR PROCESSING
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Valuation Cutoff: <strong class="text-slate-700 dark:text-slate-200">00:00 - 04:00 UTC</strong>
          </p>
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800/60 mt-4">
          All deposits and profit settlements are revalued during this institutional window.
        </div>
      </div>

      <!-- Transaction Console Widget (takes 2 columns on lg) -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-200">
        <h3 class="font-semibold text-slate-900 dark:text-white mb-4">Transaction Console</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Amount (USD)</label>
            <input 
              v-model="withdrawAmount" 
              type="number" 
              min="0"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 rounded-lg px-3 py-2 transition-colors"
              placeholder="0.00"
            />
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Destination (Wallet Address or IBAN)
            </label>
            <input 
              v-model="withdrawDestination" 
              type="text" 
              placeholder="e.g., 0x... or GB82..." 
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:border-rose-500 transition-colors" 
            />
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              @click="goToDeposit"
              class="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Go to Deposit Wizard</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <button 
              @click="handleWithdraw" 
              :disabled="!withdrawAmount"
              class="w-full sm:flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Withdraw
            </button>
          </div>
          <div v-if="transactionMessage" class="text-xs p-3 rounded bg-slate-100 dark:bg-slate-800 border text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700">
            {{ transactionMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Dynamic Tier Allocations Banner -->
    <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div :class="['inline-block text-[11px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase mb-1', currentConfig.badgeBg]">
            {{ userTier }} Tier Allocation
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ currentConfig.name }} Portfolio Allocation</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ currentConfig.desc }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span class="text-xs font-mono bg-slate-100 text-emerald-600 border border-slate-300 dark:bg-slate-800 dark:text-emerald-400 dark:border-slate-700 px-3 py-1.5 rounded-lg">
            Target APY: {{ targetApy }}
          </span>
          <span class="text-xs font-mono bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
            Min Balance: {{ minBalance }}
          </span>
          <span class="text-xs font-mono bg-slate-100 text-sky-600 border border-slate-300 dark:bg-slate-800 dark:text-sky-300 dark:border-slate-700 px-3 py-1.5 rounded-lg">
            {{ currentConfig.fee }}
          </span>
        </div>
      </div>

      <!-- Allocation Progress Bars -->
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
            <span>Fiat USD Liquidity Pool</span>
            <span class="font-mono text-slate-500 dark:text-slate-400">{{ currentConfig.fiatPct }}.00%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div class="h-full bg-sky-500 rounded-full transition-all duration-500" :style="{ width: `${currentConfig.fiatPct}%` }"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
            <span>{{ currentConfig.cryptoPoolName }}</span>
            <span class="font-mono text-slate-500 dark:text-slate-400">{{ currentConfig.cryptoPct }}.00%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div :class="['h-full rounded-full transition-all duration-500', currentConfig.cryptoBarBg]" :style="{ width: `${currentConfig.cryptoPct}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Live Exchange Price Tickers -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-xl transition-colors duration-200 overflow-hidden">
      <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Live Liquidity Pool Rates</h3>
        <div class="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-2 border border-emerald-200 dark:border-emerald-500/20">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Live API Sync
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Trading Pair</th>
              <th class="px-6 py-4">Pool Rate</th>
              <th class="px-6 py-4">Pool ID</th>
              <th class="px-6 py-4">Fee %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pool in poolRates" :key="pool.id" class="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
              <td class="px-6 py-4 font-semibold text-slate-900 dark:text-white">{{ pool.pair }}</td>
              <td class="px-6 py-4 text-sky-500 font-mono">{{ pool.price }}</td>
              <td class="px-6 py-4 text-slate-500 font-mono text-sm">{{ pool.id }}</td>
              <td class="px-6 py-4 text-slate-900 dark:text-white">{{ pool.fee }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 5. Real-Time Audit Stream -->
    <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-200">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-slate-900 dark:text-white">Real-Time Audit & Transaction Stream</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Persisted to double-entry database before WebSocket broadcast emission.</p>
        </div>
        <span class="text-xs font-mono bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-2.5 py-1 rounded">
          {{ recentTransactions.length }} Events Captured
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-950/50">
              <th class="py-2.5 px-3">Time</th>
              <th class="py-2.5 px-3">Event Type</th>
              <th class="py-2.5 px-3">Amount</th>
              <th class="py-2.5 px-3">Balance After</th>
              <th class="py-2.5 px-3">HWM Peak</th>
              <th class="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentTransactions.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-slate-500">No recent transactions found.</td>
            </tr>
            <tr v-for="tx in recentTransactions" :key="tx.id" class="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
              <td class="px-4 py-3 text-sm text-slate-500">{{ new Date(tx.created_at).toLocaleDateString() }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{{ tx.transaction_type }}</td>
              <td :class="tx.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'" class="px-4 py-3 text-sm font-mono">
                {{ tx.amount > 0 ? '+' : '' }}{{ formatCurrency(tx.amount) }}
              </td>
              <td class="px-4 py-3 text-sm text-slate-900 dark:text-white font-mono">{{ formatCurrency(tx.running_balance) }}</td>
              <!-- If HWM peak logic applies to row, display here, otherwise render standard formatting -->
              <td class="px-4 py-3 text-sm text-slate-500">--</td>
              <td class="px-4 py-3 text-sm">
                <span :class="{'text-emerald-500': tx.status === 'COMPLETED', 'text-amber-500': tx.status === 'PENDING', 'text-rose-500': tx.status === 'REJECTED' }">
                  {{ tx.status }}
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { portfolioState, livePrices, liveFeed, syncPortfolioWithAuth, connectWebSocket } from '@/services/websocket.js'
import { formatCurrency } from '@/utils/formatters.js'

const router = useRouter()
const authStore = useAuthStore()

const goToDeposit = () => {
  router.push('/dashboard/deposit')
}

/**
 * Master Configuration Object for All Supported Investment Tiers
 */
const TIER_CONFIG = {
  BRONZE: {
    name: 'Bronze',
    tierName: 'BRONZE',
    color: 'text-amber-600',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-800/60',
    badgeBg: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    targetApy: '8.00%',
    targetApyPct: 8.00,
    minBalance: '$500.00',
    minDeposit: 500,
    fee: '20.00% Performance Fee (Profits > HWM)',
    feePct: '20.00%',
    taxWithholding: '5.00%',
    desc: 'Balanced starter allocation: 70% Fiat USD Pool / 30% Crypto BTC Pool. Min deposit $500.00.',
    fiatPct: 70,
    cryptoPct: 30,
    cryptoPoolName: 'Crypto BTC Pool',
    cryptoBarBg: 'bg-amber-500'
  },
  SILVER: {
    name: 'Silver',
    tierName: 'SILVER',
    color: 'text-slate-300',
    accentColor: 'text-slate-300',
    borderColor: 'border-slate-500/30',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-600',
    targetApy: '10.00%',
    targetApyPct: 10.00,
    minBalance: '$1,000.00',
    minDeposit: 1000,
    fee: '15.00% Performance Fee (Profits > HWM)',
    feePct: '15.00%',
    taxWithholding: '5.00%',
    desc: 'Growth allocation: 60% Fiat USD Pool / 40% Crypto BTC Pool. Min deposit $1,000.00.',
    fiatPct: 60,
    cryptoPct: 40,
    cryptoPoolName: 'Crypto BTC Pool',
    cryptoBarBg: 'bg-slate-400'
  },
  GOLD: {
    name: 'Gold',
    tierName: 'GOLD',
    color: 'text-yellow-400',
    accentColor: 'text-yellow-400',
    borderColor: 'border-yellow-800/60',
    badgeBg: 'bg-yellow-950/80 text-yellow-400 border-yellow-800/60',
    targetApy: '12.00%',
    targetApyPct: 12.00,
    minBalance: '$5,000.00',
    minDeposit: 5000,
    fee: '10.00% Performance Fee (Profits > HWM)',
    feePct: '10.00%',
    taxWithholding: '5.00%',
    desc: 'High-yield allocation: 50% Fiat USD Pool / 50% Crypto BTC Pool. Min deposit $5,000.00.',
    fiatPct: 50,
    cryptoPct: 50,
    cryptoPoolName: 'Crypto BTC/ETH Pool',
    cryptoBarBg: 'bg-yellow-500'
  },
  INSTITUTIONAL: {
    name: 'Institutional',
    tierName: 'INSTITUTIONAL',
    color: 'text-purple-500',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-800/60',
    badgeBg: 'bg-purple-950/80 text-purple-400 border-purple-800/60',
    targetApy: '15.00%',
    targetApyPct: 15.00,
    minBalance: '$15,000.00',
    minDeposit: 15000,
    fee: '5.00% Performance Fee (Profits > HWM)',
    feePct: '5.00%',
    taxWithholding: '5.00%',
    desc: 'Bespoke prime institutional allocation: 40% Fiat USD / 60% Multi-Asset Pool. Min deposit $15,000.00.',
    fiatPct: 40,
    cryptoPct: 60,
    cryptoPoolName: 'Multi-Asset Prime Pool',
    cryptoBarBg: 'bg-purple-500'
  }
}

/**
 * Computed Properties extracting user tier and mapping configuration
 */
const userTier = computed(() => {
  const tier = authStore.user?.tier || authStore.user?.tier_name || authStore.accountTier || authStore.userTier || 'BRONZE'
  return String(tier).toUpperCase()
})

const currentConfig = computed(() => {
  return TIER_CONFIG[userTier.value] || TIER_CONFIG.BRONZE
})

const tierColor = computed(() => currentConfig.value.color)
const targetApy = computed(() => currentConfig.value.targetApy)
const minBalance = computed(() => currentConfig.value.minBalance)

// Transaction Console reactive state & handlers
const currentBalance = ref(0)
const hwmPeak = ref(0)
const poolRates = ref([
  { pair: 'BTC/USD', price: '$0.00', id: 'POOL_BTC_01', fee: '0.10%' },
  { pair: 'ETH/USD', price: '$0.00', id: 'POOL_ETH_01', fee: '0.15%' },
  { pair: 'USDT/USD', price: '$1.00', id: 'POOL_FIAT_01', fee: '0.00%' }
])
const recentTransactions = ref([])
const hasRejectedWithdrawals = ref(false)
const currentRejectedCount = ref(0)
const withdrawAmount = ref('')
const withdrawDestination = ref('')
const transactionMessage = ref('')

const dismissBanner = () => {
  hasRejectedWithdrawals.value = false
  // Save the current count to localStorage so we know they acknowledged this specific amount
  localStorage.setItem('dismissedRejectionsCount', currentRejectedCount.value.toString())
}

// 1. Update fetchUserBalance to map the HWM
const fetchUserBalance = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/user/profile', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (res.ok) {
      const data = await res.json()
      currentBalance.value = data.currentBalance || 0
      hwmPeak.value = data.hwmPeak || 0 // Bind HWM
      
      currentRejectedCount.value = data.rejectedCount || 0
      const dismissedCount = parseInt(localStorage.getItem('dismissedRejectionsCount') || '0', 10)
      
      // Only show banner if they have rejections AND the count is higher than what they last dismissed
      hasRejectedWithdrawals.value = currentRejectedCount.value > dismissedCount
      
      portfolioState.balance = currentBalance.value
      portfolioState.highWaterMark = hwmPeak.value
      if (authStore.user) {
        authStore.user.balance = currentBalance.value
        authStore.user.currentBalance = currentBalance.value
      }
    }
  } catch (err) {
    console.error('Failed to sync balance', err)
    // Fallback to auth store if offline/error
    currentBalance.value = authStore.user?.currentBalance || 0
  }
}

// 2. Fetch Live Rates from local market cache
const fetchLivePoolRates = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/market/ticker')
    if (res.ok) {
      const marketData = await res.json()
      
      const btc = marketData.find(c => c.symbol === 'BTC/USD')
      const eth = marketData.find(c => c.symbol === 'ETH/USD')
      
      if (btc) poolRates.value[0].price = `$${btc.price}`
      if (eth) poolRates.value[1].price = `$${eth.price}`
    }
  } catch (err) {
    console.error('Failed to fetch pool rates', err)
  }
}

// 3. Fetch Real-Time Audit Stream
const fetchTransactions = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/user/transactions', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (res.ok) {
      const data = await res.json()
      // Only keep the top 5 most recent for the dashboard stream
      recentTransactions.value = data.slice(0, 5)
    }
  } catch (err) {
    console.error('Failed to fetch transactions', err)
  }
}

const handleWithdraw = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/user/withdraw', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` 
      },
      body: JSON.stringify({ 
        amount: withdrawAmount.value, 
        destination: withdrawDestination.value 
      })
    })
    const data = await res.json()
    transactionMessage.value = data.message
    if (res.ok) {
      if (data.status === 'COMPLETED') {
        await fetchUserBalance()
        await fetchTransactions()
      }
      withdrawAmount.value = '' // clear input
      withdrawDestination.value = ''
    }
  } catch (err) {
    transactionMessage.value = 'Server error during withdrawal.'
  }
}

onMounted(async () => {
  connectWebSocket()
  await fetchUserBalance()
  await fetchLivePoolRates()
  await fetchTransactions()
  if (authStore.user) {
    await syncPortfolioWithAuth(authStore.user.userId || authStore.user.id, authStore.accountTier || authStore.userTier)
  }
  // Sync rates quietly every 60s
  setInterval(fetchLivePoolRates, 60000)
})
</script>
