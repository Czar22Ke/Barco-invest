<template>
  <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
    <h3 class="font-semibold text-white mb-4">Transaction Console</h3>
    <div class="space-y-4">
      <div>
        <label class="block text-xs text-slate-400 mb-1">Amount (USD)</label>
        <input 
          v-model="txAmount" 
          type="number" 
          min="0"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          placeholder="0.00"
        />
      </div>
      <div class="flex gap-3">
        <button 
          @click="handleDeposit" 
          :disabled="isProcessing || !txAmount"
          class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          Deposit
        </button>
        <button 
          @click="handleWithdraw" 
          :disabled="isProcessing || !txAmount"
          class="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          Withdraw
        </button>
      </div>
      <div v-if="txMessage" :class="['text-xs p-3 rounded bg-slate-800 border', isError ? 'text-rose-400 border-rose-900/50' : 'text-emerald-400 border-emerald-900/50']">
        {{ txMessage }}
      </div>
    </div>
  </div>
</template>

import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { depositFunds } from '../services/transactions';
import { portfolioState } from '../services/websocket'; 
import { formatCurrency } from '../utils/formatters.js';

const authStore = useAuthStore();
const txAmount = ref('');
const isProcessing = ref(false);
const txMessage = ref('');
const isError = ref(false);

const handleDeposit = async () => {
  isProcessing.value = true;
  txMessage.value = '';
  isError.value = false;
  try {
    const res = await depositFunds(txAmount.value);
    txMessage.value = `Deposit successful. New Balance: ${formatCurrency(res.newBalance)}`;
    if (portfolioState) portfolioState.balance = parseFloat(res.newBalance);
    txAmount.value = '';
  } catch (err) {
    isError.value = true;
    txMessage.value = err.message;
  } finally {
    isProcessing.value = false;
  }
};

const handleWithdraw = async () => {
  isProcessing.value = true;
  txMessage.value = '';
  isError.value = false;
  try {
    const res = await fetch('http://localhost:5000/api/user/withdraw', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` 
      },
      body: JSON.stringify({ amount: txAmount.value })
    });
    const data = await res.json();
    txMessage.value = data.message;
    if (res.ok) {
      if (data.status === 'COMPLETED' && portfolioState) {
        portfolioState.balance = Math.max(0, (portfolioState.balance || 0) - parseFloat(txAmount.value));
      }
      txAmount.value = '';
    } else {
      isError.value = true;
    }
  } catch (err) {
    isError.value = true;
    txMessage.value = 'Server error during withdrawal.';
  } finally {
    isProcessing.value = false;
  }
};
</script>
