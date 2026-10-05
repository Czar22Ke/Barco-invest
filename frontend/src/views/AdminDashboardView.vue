<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white p-6 transition-colors duration-200">
    <div class="max-w-4xl mx-auto space-y-6">
      
      <header class="mb-8 flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Admin Command Center</h1>
          <p class="text-slate-500 dark:text-slate-400">Manage global institutional operations and yield distributions.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Theme Toggle Button -->
          <button 
            @click="toggleTheme" 
            class="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Toggle Dark/Light Mode"
          >
            <span v-if="isDark">☀️ Light</span>
            <span v-else>🌙 Dark</span>
          </button>

          <!-- Sign Out Button -->
          <button 
            @click="handleLogout"
            class="bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-600/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm dark:shadow-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      <!-- Yield Engine Control Panel -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Automated Yield Engine</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Trigger the daily APY profit distribution across all funded user tiers. 
              Cryptographic idempotency prevents double-payouts for the current date.
            </p>
          </div>
          <div class="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded border border-slate-200 dark:border-slate-700">
            CRON: 00:01 Daily
          </div>
        </div>
        
        <button 
          @click="triggerGlobalYield" 
          :disabled="isProcessing"
          class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="isProcessing" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isProcessing ? 'Processing Global Batch...' : 'Force Daily Yield Payout' }}
        </button>

        <!-- Batch Results Readout -->
        <div v-if="batchResult" class="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Latest Batch Execution Results</h4>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <div class="text-slate-500 dark:text-slate-400 mb-1">Processed</div>
              <div class="text-xl font-mono text-emerald-500 dark:text-emerald-400">{{ batchResult.processedCount }}</div>
            </div>
            <div class="p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <div class="text-slate-500 dark:text-slate-400 mb-1">Skipped (Already Paid)</div>
              <div class="text-xl font-mono text-slate-700 dark:text-slate-300">{{ batchResult.skippedCount }}</div>
            </div>
            <div class="p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <div class="text-slate-500 dark:text-slate-400 mb-1">Errors</div>
              <div class="text-xl font-mono text-rose-500 dark:text-rose-400">{{ batchResult.errorCount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Targeted Bonus Engine -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Targeted Bonus Engine</h3>
        </div>
        
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Target Segment</label>
              <select v-model="bonusTargetMode" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:border-purple-500 transition-colors">
                <option value="ALL">Global (All Users)</option>
                <option value="TIER">Specific Tier</option>
                <option value="USER">Specific User (Email)</option>
              </select>
            </div>
            
            <div class="flex-1" v-if="bonusTargetMode !== 'ALL'">
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {{ bonusTargetMode === 'TIER' ? 'Select Tier' : 'User Email' }}
              </label>
              <select v-if="bonusTargetMode === 'TIER'" v-model="bonusTargetValue" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:border-purple-500 transition-colors">
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="INSTITUTIONAL">Institutional</option>
              </select>
              <input v-else v-model="bonusTargetValue" type="email" placeholder="user@email.com" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:border-purple-500 transition-colors" />
            </div>
          </div>

          <div class="flex gap-2 items-end">
            <div class="relative flex-1">
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bonus Percentage</label>
              <input v-model="bonusPercentage" type="number" min="0.1" step="0.1" placeholder="e.g., 5" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2 pr-8 rounded-lg focus:border-purple-500 transition-colors" />
              <span class="absolute right-3 top-8 text-slate-400 font-bold">%</span>
            </div>
            <button @click="handleBonusDistribution" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors h-[42px]">
              Execute Bonus
            </button>
          </div>
        </div>
      </div>

      <!-- Access Management -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200 mt-6">
        <div class="mb-4">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Access Management</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Provision new staff accounts. These accounts bypass standard tier requirements.</p>
        </div>
        
        <form @submit.prevent="handleProvision" class="flex flex-wrap items-end gap-4">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Staff Email</label>
            <input v-model="provisionForm.email" type="email" required class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors">
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Temporary Password</label>
            <input v-model="provisionForm.password" type="password" required class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors">
          </div>
          <div class="w-48">
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Clearance Level</label>
            <select v-model="provisionForm.role" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 appearance-none transition-colors">
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg transition-colors h-[42px]">
            Provision Account
          </button>
        </form>
        
        <p v-if="provisionMessage.text" :class="provisionMessage.type === 'success' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'" class="text-sm mt-4 font-medium">
          {{ provisionMessage.text }}
        </p>
      </div>

      <!-- User Directory & Moderation -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200 mt-6 overflow-hidden">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">User Directory & Moderation</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Monitor client accounts, track balances, and flag suspicious activity.</p>
          </div>
          <button @click="fetchUsers" class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 transition-colors">
             Refresh ↻
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="px-4 py-3 rounded-tl-lg">User / Email</th>
                <th class="px-4 py-3">Tier</th>
                <th class="px-4 py-3">Net Balance</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingUsers"><td colspan="5" class="text-center py-4">Loading directory...</td></tr>
              <tr v-else-if="users.length === 0"><td colspan="5" class="text-center py-4">No user accounts found.</td></tr>
              <tr v-for="user in users" :key="user.user_id" class="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-300">{{ user.email }}</td>
                <td class="px-4 py-3 font-mono text-xs">{{ user.tier_name || 'NONE' }}</td>
                <td class="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(user.current_balance) }}</td>
                <td class="px-4 py-3">
                  <span :class="user.account_status === 'FLAGGED' ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'" class="px-2 py-1 rounded text-xs border font-semibold">
                    {{ user.account_status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button @click="toggleUserFlag(user.user_id, user.account_status)" class="text-xs px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors">
                    {{ user.account_status === 'FLAGGED' ? 'Unflag' : 'Flag' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Transactions Review Queue -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200 mt-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Pending Transactions Queue</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Review and approve deposits (Proof-of-Payment) and withdrawal requests.</p>
          </div>
          <button @click="fetchPendingWithdrawals" class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 transition-colors">Refresh ↻</button>
        </div>
        
        <div v-if="pendingWithdrawals.length === 0" class="text-slate-500 dark:text-slate-400 text-sm py-4">
          No pending transactions in the queue.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">User</th>
                <th class="px-4 py-3">Current Balance</th>
                <th class="px-4 py-3">Requested Amount</th>
                <th class="px-4 py-3">TxID</th>
                <th class="px-4 py-3">Destination</th>
                <th class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in pendingWithdrawals" :key="req.id" class="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td class="px-4 py-3 text-xs">{{ new Date(req.created_at).toLocaleString() }}</td>
                <td class="px-4 py-3">
                  <span :class="req.transaction_type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'" class="px-2 py-0.5 rounded text-xs border font-semibold">
                    {{ req.transaction_type || 'WITHDRAWAL' }}
                  </span>
                </td>
                <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-300">{{ req.email }}</td>
                <td class="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400">{{ formatCurrency(req.current_balance) }}</td>
                <td class="px-4 py-3 font-mono font-semibold" :class="req.transaction_type === 'DEPOSIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
                  {{ req.transaction_type === 'DEPOSIT' ? '+' : '-' }}{{ formatCurrency(req.amount) }}
                </td>
                <td class="px-4 py-3 font-mono text-xs text-slate-500 max-w-[150px] truncate" :title="req.tx_hash">{{ req.tx_hash || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono">
                  <div class="flex items-center gap-2">
                    <span :title="req.destination_address">
                      {{ req.destination_address ? req.destination_address.substring(0, 12) + '...' : 'N/A' }}
                    </span>
                    <button 
                      v-if="req.destination_address" 
                      @click="copyToClipboard(req.destination_address)"
                      class="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                      title="Copy full address"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button 
                      @click="handleApprove(req)" 
                      class="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded transition-colors"
                      title="Approve"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button 
                      @click="handleReject(req)" 
                      class="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 rounded transition-colors"
                      title="Reject"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Adjust path if needed
import { useTheme } from '../composables/useTheme';
import { formatCurrency } from '../utils/formatters'; // Ensure this exists

const router = useRouter();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Destination address copied!');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

const handleLogout = () => {
  // Call the store's logout action to clear the JWT token
  if (authStore.logout) {
    authStore.logout();
  } else {
    // Fallback just in case
    localStorage.removeItem('user_token'); 
  }
  
  // Redirect to the login screen
  router.push('/login');
};

const isProcessing = ref(false);
const batchResult = ref(null);

const provisionForm = ref({ email: '', password: '', role: 'MODERATOR' });
const provisionMessage = ref({ text: '', type: '' });

const users = ref([]);
const isLoadingUsers = ref(false);

const fetchUsers = async () => {
  isLoadingUsers.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (res.ok) users.value = data;
  } catch (err) {
    console.error('Failed to load users:', err);
  } finally {
    isLoadingUsers.value = false;
  }
};

const toggleUserFlag = async (userId, currentStatus) => {
  const newStatus = currentStatus === 'FLAGGED' ? 'ACTIVE' : 'FLAGGED';
  if (!confirm(`Change account status to ${newStatus}?`)) return;
  
  try {
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/flag`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchUsers(); // Reload table
  } catch (err) {
    alert('Failed to update status');
  }
};

const pendingWithdrawals = ref([]);

const fetchPendingWithdrawals = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/withdrawals/pending`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) pendingWithdrawals.value = await res.json();
  } catch (err) {
    console.error('Failed to fetch pending withdrawals', err);
  }
};

const handleApprove = async (req) => {
  const type = (req.transaction_type || 'withdrawal').toLowerCase();
  if (!confirm(`Are you sure you want to approve this ${type}?`)) return;
  try {
    const res = await fetch(`http://localhost:5000/api/admin/withdrawals/${req.id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) fetchPendingWithdrawals();
  } catch (err) {
    alert(`Failed to approve ${type}.`);
  }
};

const handleReject = async (req) => {
  const type = (req.transaction_type || 'withdrawal').toLowerCase();
  if (!confirm(`Are you sure you want to reject this ${type}?`)) return;
  try {
    const res = await fetch(`http://localhost:5000/api/admin/withdrawals/${req.id}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) fetchPendingWithdrawals();
  } catch (err) {
    alert(`Failed to reject ${type}.`);
  }
};

onMounted(() => {
  fetchUsers();
  fetchPendingWithdrawals();
});

const handleProvision = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/provision`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` 
      },
      body: JSON.stringify(provisionForm.value)
    });
    
    const data = await res.json();
    if (res.ok) {
      provisionMessage.value = { text: data.message, type: 'success' };
      provisionForm.value = { email: '', password: '', role: 'MODERATOR' }; // Reset
    } else {
      provisionMessage.value = { text: data.message, type: 'error' };
    }
  } catch (err) {
    provisionMessage.value = { text: 'Server error during provisioning.', type: 'error' };
  }
};

const bonusPercentage = ref('');
const bonusTargetMode = ref('ALL');
const bonusTargetValue = ref('');

const handleBonusDistribution = async () => {
  if (!bonusPercentage.value || bonusPercentage.value <= 0) {
    alert('Please enter a valid percentage.');
    return;
  }
  
  if (bonusTargetMode.value !== 'ALL' && !bonusTargetValue.value.trim()) {
    alert('Please specify the target tier or email.');
    return;
  }
  
  const confirmMsg = bonusTargetMode.value === 'ALL' 
    ? `Are you sure you want to issue a ${bonusPercentage.value}% bonus to ALL funded accounts?`
    : `Are you sure you want to issue a ${bonusPercentage.value}% bonus to ${bonusTargetValue.value}?`;

  if (!window.confirm(confirmMsg)) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/bonus/distribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ 
        percentage: bonusPercentage.value,
        targetMode: bonusTargetMode.value,
        targetValue: bonusTargetValue.value.trim()
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      bonusPercentage.value = '';
      bonusTargetValue.value = '';
      fetchUsers();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert('Network error while distributing bonuses.');
  }
};

const triggerGlobalYield = async () => {
  if (!confirm('Are you sure you want to trigger the global yield distribution?')) return;
  
  isProcessing.value = true;
  batchResult.value = null;
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/trigger-yield`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to trigger batch job.');
    
    batchResult.value = data;
  } catch (error) {
    alert(error.message);
  } finally {
    isProcessing.value = false;
  }
};
</script>
