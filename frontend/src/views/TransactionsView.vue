<template>
  <div class="space-y-6 max-w-5xl">
    <!-- Header -->
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Transactions</h2>
      <p class="text-slate-500 dark:text-slate-400 text-sm">List of transactions in your account.</p>
    </header>

    <!-- Tab Navigation -->
    <div class="flex gap-8 border-b border-slate-200 dark:border-slate-800 mb-6">
      <button 
        @click="setTab('history')" 
        :class="activeTab === 'history' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300'"
        class="pb-3 text-sm font-semibold transition-colors font-sans"
      >
        History
      </button>
      <button 
        @click="setTab('deposit')" 
        :class="activeTab === 'deposit' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300'"
        class="pb-3 text-sm font-semibold transition-colors font-sans"
      >
        Deposit
      </button>
      <button 
        @click="setTab('withdraw')" 
        :class="activeTab === 'withdraw' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300'"
        class="pb-3 text-sm font-semibold transition-colors font-sans"
      >
        Withdraw
      </button>
    </div>

    <!-- Data Container -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-lg overflow-hidden min-h-[200px] transition-colors duration-200">
      
      <!-- Loading State -->
      <div v-if="isLoading" class="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        Loading data...
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredTransactions.length === 0" class="p-8 text-slate-500 dark:text-slate-400 text-sm">
        No transactions found!
      </div>

      <!-- Transaction Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Amount</th>
              <th class="px-6 py-4 text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in filteredTransactions" :key="tx.id" class="border-b border-slate-200/70 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
              <td class="px-6 py-4">{{ formatDate(tx.created_at) }}</td>
              <td class="px-6 py-4 font-medium text-slate-800 dark:text-slate-300">{{ tx.transaction_type || 'LEDGER ENTRY' }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-col items-start gap-1">
                  <span :class="getStatusClass(tx.status)" class="px-2 py-1 rounded text-[10px] border font-bold uppercase tracking-wider">
                    {{ tx.status || 'COMPLETED' }}
                  </span>
                  <span v-if="tx.status === 'REJECTED'" class="text-[10px] text-rose-500 dark:text-rose-400 font-medium">
                    Contact Support
                  </span>
                </div>
              </td>
              <td :class="tx.amount >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'" class="px-6 py-4 text-right font-mono">
                {{ tx.amount > 0 ? '+' : '' }}{{ formatCurrency(tx.amount) }}
              </td>
              <td class="px-6 py-4 text-right font-mono text-slate-900 dark:text-white">
                {{ tx.running_balance !== null && tx.running_balance !== undefined ? formatCurrency(tx.running_balance) : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { formatCurrency } from '../utils/formatters';

const authStore = useAuthStore();
const transactions = ref([]);
const isLoading = ref(true);
const activeTab = ref('history'); // 'history', 'deposit', 'withdraw'

const getStatusClass = (status) => {
  switch (status) {
    case 'REJECTED':
      return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20';
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20';
    case 'COMPLETED':
    default:
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  }
};

const filteredTransactions = computed(() => {
  if (activeTab.value === 'history') return transactions.value;
  if (activeTab.value === 'deposit') {
    return transactions.value.filter(tx => tx.transaction_type === 'DEPOSIT');
  }
  if (activeTab.value === 'withdraw') {
    return transactions.value.filter(tx => tx.transaction_type === 'WITHDRAWAL');
  }
  return [];
});

const setTab = (tab) => {
  activeTab.value = tab;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/user/transactions', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) transactions.value = await res.json();
  } catch (err) {
    console.error('Failed to load transactions', err);
  } finally {
    isLoading.value = false;
  }
});
</script>
