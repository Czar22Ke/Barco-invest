<template>
  <div class="toast-container">
    <transition-group name="toast-slide">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-card"
        :class="toast.type"
      >
        <div class="toast-icon">
          <span v-if="toast.type === 'withdrawal'">💸</span>
          <span v-else-if="toast.type === 'yield'">📈</span>
          <span v-else>✅</span>
        </div>

        <div class="toast-content">
          <h4 class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
          <div v-if="toast.details" class="toast-details">
            <span>Payout: <strong>${{ toast.details.netPayout }}</strong></span>
            <span class="text-muted">| Deductions: ${{ toast.details.totalDeductions }}</span>
          </div>
        </div>

        <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { toasts, removeToast } from '@/services/websocket.js';
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
  width: calc(100vw - 48px);
  pointer-events: none;
}

.toast-card {
  pointer-events: auto;
  background: #e0f2fe; /* Light-blue accent background */
  border: 1px solid #0284c7; /* Light-blue border */
  color: #0369a1;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.25);
  position: relative;
}

.toast-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0c4a6e;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 0.825rem;
  color: #0369a1;
  line-height: 1.4;
}

.toast-details {
  margin-top: 6px;
  font-size: 0.775rem;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #0369a1;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  opacity: 0.7;
}

.toast-close:hover {
  opacity: 1;
}

/* Slide Transition */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
