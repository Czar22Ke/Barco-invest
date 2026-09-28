<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white p-6 transition-colors duration-200">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <header class="mb-8 flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Moderator Operations</h1>
          <p class="text-slate-500 dark:text-slate-400">Monitor client accounts, track login activity, and flag suspicious behavior.</p>
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
            Sign Out
          </button>
        </div>
      </header>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200 overflow-hidden">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">User Directory</h3>
          <button @click="fetchUsers" class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 transition-colors">Refresh ↻</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="px-4 py-3">User / Email</th>
                <th class="px-4 py-3">Tier</th>
                <th class="px-4 py-3">Net Balance</th>
                <th class="px-4 py-3">Last Login</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.user_id" class="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-300">{{ user.email }}</td>
                <td class="px-4 py-3 font-mono text-xs">{{ user.tier_name || 'NONE' }}</td>
                <td class="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(user.current_balance) }}</td>
                <td class="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{{ formatDate(user.last_login) }}</td>
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

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTheme } from '../composables/useTheme';
import { formatCurrency } from '../utils/formatters';

const router = useRouter();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();
const users = ref([]);

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
};

const handleLogout = () => {
  if (authStore.logout) authStore.logout();
  else localStorage.removeItem('user_token');
  router.push('/login');
};

const fetchUsers = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/moderator/users', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) users.value = await res.json();
  } catch (err) {
    console.error(err);
  }
};

const toggleUserFlag = async (userId, currentStatus) => {
  const newStatus = currentStatus === 'FLAGGED' ? 'ACTIVE' : 'FLAGGED';
  if (!confirm(`Change account status to ${newStatus}?`)) return;
  
  try {
    const res = await fetch(`http://localhost:5000/api/moderator/users/${userId}/flag`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchUsers();
  } catch (err) {
    alert('Failed to update status');
  }
};

onMounted(() => fetchUsers());
</script>
