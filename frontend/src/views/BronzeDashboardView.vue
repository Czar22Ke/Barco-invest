<template>
  <BronzeDashboard />
</template>

<script setup>
import { onMounted } from 'vue';
import BronzeDashboard from './BronzeDashboard.vue';
import { portfolioState, syncPortfolioWithAuth } from '@/services/websocket.js';
import { useAuthStore } from '@/stores/auth.js';

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.user) {
    await syncPortfolioWithAuth(authStore.user.userId || authStore.user.user_id, authStore.accountTier || authStore.userTier);
    portfolioState.balance = parseFloat(authStore.user.balance || authStore.user.currentBalance || portfolioState.balance || 0);
  }
});
</script>
