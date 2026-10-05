<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const userDetails = ref({ email: '', tier: 'BRONZE', role: 'USER' });

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const messageType = ref('');

const fetchProfile = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      userDetails.value = {
        email: data.email || '',
        tier: data.tier_name || data.tier || 'BRONZE',
        role: data.role || 'USER'
      };
    }
  } catch (err) {
    console.error('Failed to fetch profile', err);
  }
};

const updatePassword = async () => {
  if (!currentPassword.value) {
    messageType.value = 'error';
    message.value = 'Please enter your current password.';
    return;
  }
  if (!newPassword.value || newPassword.value.length < 6) {
    messageType.value = 'error';
    message.value = 'New password must be at least 6 characters long.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    messageType.value = 'error';
    message.value = 'New passwords do not match.';
    return;
  }
  if (currentPassword.value === newPassword.value) {
    messageType.value = 'error';
    message.value = 'New password cannot be the same as your current password.';
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` 
      },
      body: JSON.stringify({ 
        currentPassword: currentPassword.value, 
        newPassword: newPassword.value 
      })
    });
    const data = await res.json();
    
    if (res.ok) {
      messageType.value = 'success';
      message.value = 'Password securely updated.';
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
    } else {
      messageType.value = 'error';
      message.value = data.message;
    }
  } catch (err) {
    messageType.value = 'error';
    message.value = 'An error occurred updating password.';
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and security preferences.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Account Identity Card -->
      <div class="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm h-fit">
        <div class="flex flex-col items-center text-center">
          <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
            {{ userDetails.email ? userDetails.email.charAt(0).toUpperCase() : 'U' }}
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate w-full">{{ userDetails.email }}</h3>
          <p class="text-sm text-slate-500 mb-4">{{ userDetails.role }}</p>
          
          <div class="w-full pt-4 border-t border-slate-200 dark:border-slate-800">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500">Account Tier</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ userDetails.tier }}</span>
            </div>
            <div class="flex justify-between items-center text-sm mt-2">
              <span class="text-slate-500">Status</span>
              <span class="font-bold text-emerald-500">Verified</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings Card -->
      <div class="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Security Settings</h3>
        
        <div v-if="message" :class="messageType === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'" class="p-4 rounded-lg mb-6 text-sm font-medium">
          {{ message }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input v-model="currentPassword" type="password" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors" />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input v-model="newPassword" type="password" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input v-model="confirmPassword" type="password" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors" />
            </div>
          </div>

          <div class="pt-4">
            <button @click="updatePassword" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
