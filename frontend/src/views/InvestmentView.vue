<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const mainBalance = ref(0);
const investedBalance = ref(0);
const profitBalance = ref(0);
const investAmount = ref('');
const message = ref('');
const messageType = ref(''); // 'error' or 'success'

const fetchBalances = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const totalLedgerBalance = data.currentBalance || data.balance || 0;
      
      investedBalance.value = parseFloat(data.invested_balance || 0);
      profitBalance.value = parseFloat(data.profit_balance || 0);
      
      // Available Funds = Total Portfolio Balance - Locked (Invested)
      mainBalance.value = totalLedgerBalance - investedBalance.value;
    }
  } catch (err) {
    console.error('Failed to fetch balances', err);
  }
};

const handleInvest = async () => {
  if (mainBalance.value <= 0) {
    messageType.value = 'error';
    message.value = 'No funds in account! Please deposit capital first.';
    return;
  }
  const parsedAmount = parseFloat(investAmount.value);
  if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
    messageType.value = 'error';
    message.value = 'Please enter a valid amount.';
    return;
  }
  if (parsedAmount > mainBalance.value) {
    messageType.value = 'error';
    message.value = 'Insufficient available funds.';
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/invest`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` 
      },
      body: JSON.stringify({ amount: parsedAmount })
    });
    const data = await res.json();
    
    if (res.ok) {
      investedBalance.value += parsedAmount;
      mainBalance.value -= parsedAmount;
      investAmount.value = '';
      messageType.value = 'success';
      message.value = 'Capital successfully allocated!';
    } else {
      messageType.value = 'error';
      message.value = data.message;
    }
  } catch (err) {
    messageType.value = 'error';
    message.value = 'An error occurred during allocation.';
  }
};

const fetchUserBalance = fetchBalances;

// Modal State
const showUnlockModal = ref(false);
const isUnlocking = ref(false);
const unlockMessage = ref('');
const unlockSuccess = ref(false);

const triggerUnlock = () => {
  unlockMessage.value = '';
  unlockSuccess.value = false;
  showUnlockModal.value = true;
};

const closeUnlockModal = () => {
  if (isUnlocking.value) return;
  showUnlockModal.value = false;
  unlockMessage.value = '';
  unlockSuccess.value = false;
};

const confirmUnlock = async () => {
  isUnlocking.value = true;
  unlockMessage.value = '';
  unlockSuccess.value = false;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/investment/unlock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (res.ok) {
      unlockSuccess.value = true;
      unlockMessage.value = data.message;
      fetchUserBalance();
      setTimeout(() => {
        closeUnlockModal();
      }, 1400);
    } else {
      unlockSuccess.value = false;
      unlockMessage.value = data.message || 'Liquidation failed.';
    }
  } catch (err) {
    unlockSuccess.value = false;
    unlockMessage.value = 'Network error during liquidation.';
    console.error(err);
  } finally {
    isUnlocking.value = false;
  }
};

const unlockCapital = triggerUnlock;

onMounted(() => {
  fetchBalances();
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Investment Plans</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Allocate your liquid capital to generate yield.</p>
      </div>
      <router-link to="/dashboard/deposit" class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-semibold transition-colors border border-slate-200 dark:border-slate-700">
        Deposit Funds ➔
      </router-link>
    </div>

    <!-- Wallet Compartmentalization Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 class="text-slate-500 dark:text-slate-400 font-medium mb-4">Investment Account</h3>
        <div class="flex items-end gap-8">
          <div>
            <p class="text-3xl font-mono font-bold text-slate-900 dark:text-white">{{ formatCurrency(mainBalance) }}</p>
            <p class="text-xs text-slate-500 mt-1">Available Funds</p>
          </div>
          <div class="text-2xl text-slate-300 dark:text-slate-700">+</div>
          <div>
            <p class="text-xl font-mono font-bold text-slate-400">{{ formatCurrency(investedBalance) }}</p>
            <p class="text-xs text-slate-500 mt-1">Locked (Invested)</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-slate-500 dark:text-slate-400 font-medium">Performance Tracking</h3>
            <span :class="investedBalance > 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'" class="text-xs font-bold px-2 py-1 rounded">
              {{ investedBalance > 0 ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex items-end gap-8">
            <div>
              <p class="text-3xl font-mono font-bold text-slate-900 dark:text-white">{{ formatCurrency(investedBalance) }}</p>
              <p class="text-xs text-slate-500 mt-1">Currently Invested</p>
            </div>
            <div class="text-2xl text-slate-300 dark:text-slate-700">+</div>
            <div>
              <p class="text-xl font-mono font-bold text-emerald-500">{{ formatCurrency(profitBalance) }}</p>
              <p class="text-xs text-slate-500 mt-1">Approx Profit</p>
            </div>
          </div>
        </div>

        <!-- Unlock Capital Action -->
        <div v-if="investedBalance > 0" class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400">Locked Capital: {{ formatCurrency(investedBalance) }}</span>
          <button 
            @click="triggerUnlock" 
            class="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Unlock Capital
          </button>
        </div>
      </div>
    </div>

    <!-- Investment Action Console -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Invest & Earn</h3>
      
      <div v-if="message" :class="messageType === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'" class="p-4 rounded-lg mb-6 text-sm font-medium">
        {{ message }}
      </div>

      <div v-if="mainBalance <= 0" class="text-center py-8">
        <div class="text-4xl mb-4">💼</div>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No funds in account!</h4>
        <p class="text-slate-500 dark:text-slate-400 mb-6">We regret that you have no liquid funds in your account. Please make a deposit and try again once funds are available.</p>
        <router-link to="/dashboard/deposit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors inline-block">
          Deposit Now
        </router-link>
      </div>

      <div v-else class="flex flex-col md:flex-row gap-4 items-end">
        <div class="w-full md:w-2/3">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount to Invest (USD)</label>
          <input v-model="investAmount" type="number" :max="mainBalance" placeholder="0.00" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
        <button @click="handleInvest" class="w-full md:w-1/3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors">
          Confirm Investment
        </button>
      </div>
    </div>

    <!-- Text-Only Early Liquidation Warning Modal -->
    <div 
      v-if="showUnlockModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 class="text-lg font-bold text-rose-600 dark:text-rose-400">
            Early Liquidation Warning
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            You are attempting to unlock your capital before the 30-day vesting period has matured.
          </p>
        </div>

        <ul class="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-xl font-medium">
          <li class="flex items-start gap-2">
            <span>•</span>
            <span>Total forfeiture of all currently accrued profits.</span>
          </li>
          <li class="flex items-start gap-2">
            <span>•</span>
            <span>A 5% early withdrawal penalty will be deducted from your principal.</span>
          </li>
        </ul>

        <div v-if="unlockMessage" :class="unlockSuccess ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'" class="p-3 rounded-lg text-xs font-semibold border">
          {{ unlockMessage }}
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button 
            type="button"
            @click="closeUnlockModal"
            :disabled="isUnlocking"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button"
            @click="confirmUnlock"
            :disabled="isUnlocking"
            class="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="isUnlocking" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isUnlocking ? 'Liquidating' : 'Proceed & Liquidate' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
