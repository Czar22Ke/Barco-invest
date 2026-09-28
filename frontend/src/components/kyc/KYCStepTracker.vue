<template>
  <div class="kyc-tracker-container">
    <div class="tracker-header flex-between">
      <span class="tracker-step-title">
        Step {{ currentStepNum }} of 3: <strong>{{ stepTitle }}</strong>
      </span>
      <span class="tracker-percentage font-mono">{{ progressPercentage }}% Completed</span>
    </div>

    <!-- Progress Bar Fill -->
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <!-- Step Circles -->
    <div class="steps-nodes">
      <div 
        class="step-node" 
        :class="{ active: currentStepNum >= 1, completed: currentStepNum > 1 }"
      >
        <span class="node-number">1</span>
        <span class="node-label">Personal Data</span>
      </div>

      <div class="step-connector" :class="{ active: currentStepNum >= 2 }"></div>

      <div 
        class="step-node" 
        :class="{ active: currentStepNum >= 2, completed: currentStepNum > 2 }"
      >
        <span class="node-number">2</span>
        <span class="node-label">Document Upload</span>
      </div>

      <div class="step-connector" :class="{ active: currentStepNum >= 3 }"></div>

      <div 
        class="step-node" 
        :class="{ active: currentStepNum >= 3, completed: isCompleted }"
      >
        <span class="node-number">3</span>
        <span class="node-label">Liveness Check</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthKYC } from '@/composables/useAuthKYC.js';

const { currentStep, STEPS } = useAuthKYC();

const currentStepNum = computed(() => {
  switch (currentStep.value) {
    case STEPS.KYC_PERSONAL: return 1;
    case STEPS.KYC_DOCUMENTS: return 2;
    case STEPS.KYC_LIVENESS: return 3;
    case STEPS.KYC_COMPLETE: return 3;
    default: return 1;
  }
});

const isCompleted = computed(() => currentStep.value === STEPS.KYC_COMPLETE);

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case STEPS.KYC_PERSONAL: return 'Personal Identity Details';
    case STEPS.KYC_DOCUMENTS: return 'Government ID Document Upload';
    case STEPS.KYC_LIVENESS: return 'Webcam Biometric Liveness Check';
    case STEPS.KYC_COMPLETE: return 'Verification Complete';
    default: return 'Identity Verification';
  }
});

const progressPercentage = computed(() => {
  switch (currentStep.value) {
    case STEPS.KYC_PERSONAL: return 33;
    case STEPS.KYC_DOCUMENTS: return 66;
    case STEPS.KYC_LIVENESS: return 90;
    case STEPS.KYC_COMPLETE: return 100;
    default: return 33;
  }
});
</script>

<style scoped>
.kyc-tracker-container {
  margin-bottom: 36px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid var(--bg-dark-border);
  padding: 24px;
  border-radius: 12px;
}

.tracker-header {
  font-size: 0.95rem;
  color: var(--text-dark-theme);
  margin-bottom: 12px;
}

.tracker-step-title strong {
  color: var(--primary-light);
}

.tracker-percentage {
  color: var(--primary-light);
  font-weight: 700;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0284c7, #38bdf8);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.steps-nodes {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-node {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step-node.active {
  opacity: 1;
}

.node-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-dark);
  border: 2px solid var(--bg-dark-border);
  color: var(--text-dark-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.step-node.active .node-number {
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
}

.step-node.completed .node-number {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}

.node-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dark-theme);
}

.step-connector {
  flex: 1;
  height: 2px;
  background: var(--bg-dark-border);
  margin: 0 16px;
  opacity: 0.3;
}

.step-connector.active {
  background: #38bdf8;
  opacity: 0.8;
}
</style>
