<template>
  <div class="auth-view section-dark">
    <div class="container">
      <Login2FACard />
    </div>
  </div>
</template>

<script setup>
import Login2FACard from '@/components/auth/Login2FACard.vue';
</script>

<style scoped>
.auth-view {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
