<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const step = ref(1);
const amount = ref('');
const txHash = ref('');
const method = ref('Crypto Wallet');
const message = ref('');

const nextStep = () => {
  if (step.value === 2 && (parseFloat(amount.value) < 1 || !amount.value)) {
    message.value = 'Minimum deposit is $1.00';
    return;
  }
  message.value = '';
  step.value++;
};

const submitDeposit = async () => {
  if (!txHash.value) {
    message.value = 'Please provide the Transaction Hash.';
    return;
  }
  try {
    const res = await fetch('http://localhost:5000/api/user/deposit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` 
      },
      body: JSON.stringify({ amount: amount.value, method: method.value, txHash: txHash.value })
    });
    const data = await res.json();
    if (res.ok) {
      step.value = 4; // Success Screen
    } else {
      message.value = data.message;
    }
  } catch (err) {
    message.value = 'An error occurred during submission.';
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-colors duration-200">
    <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Deposit Funds</h2>
    
    <div v-if="message" class="mb-4 text-sm text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-3 rounded">
      {{ message }}
    </div>

    <!-- Step 1: Method -->
    <div v-if="step === 1">
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Select from payment options below:</p>
      <label class="flex items-center gap-3 p-4 border border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer">
        <input type="radio" v-model="method" value="Crypto Wallet" checked class="text-blue-600 focus:ring-blue-500" />
        <span class="font-medium text-slate-900 dark:text-white">Crypto Wallet</span>
      </label>
      <button @click="nextStep" class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors">
        Continue
      </button>
    </div>

    <!-- Step 2: Amount -->
    <div v-if="step === 2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount to Deposit (USD)</label>
      <input v-model="amount" type="number" min="1" placeholder="0.00" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none mb-2" />
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Minimum 1.00 USD</p>
      
      <div class="flex gap-4">
        <button @click="step--" class="w-1/3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 rounded-lg font-bold transition-colors">Back</button>
        <button @click="nextStep" class="w-2/3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors">Continue to Deposit</button>
      </div>
    </div>

    <!-- Step 3: Payment & TxID -->
    <div v-if="step === 3">
      <div class="text-center mb-6">
        <p class="text-sm text-slate-500 dark:text-slate-400">Please send exactly</p>
        <p class="text-3xl font-mono font-bold text-emerald-500">{{ parseFloat(amount).toFixed(2) }} USD</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">to the address below:</p>
      </div>
      
      <div class="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-center mb-6">
        <p class="font-mono text-xs md:text-sm text-slate-900 dark:text-white break-all">
          bc1qdjxhqndf5sdj8ha3udv8qzcw096pek7cwtvw8q
        </p>
      </div>

      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Transaction Hash (TxID) *</label>
      <input v-model="txHash" type="text" placeholder="Paste your blockchain receipt here..." class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none mb-6" />
      
      <div class="flex gap-4">
        <button @click="step--" class="w-1/3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 rounded-lg font-bold transition-colors">Back</button>
        <button @click="submitDeposit" class="w-2/3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors">Submit Proof of Payment</button>
      </div>
    </div>

    <!-- Step 4: Success -->
    <div v-if="step === 4" class="text-center py-8">
      <div class="text-5xl mb-4">✅</div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Deposit Submitted</h3>
      <p class="text-slate-500 dark:text-slate-400">Your transaction is currently pending verification. Your balance will be updated once approved by an administrator.</p>
    </div>
  </div>
</template>
