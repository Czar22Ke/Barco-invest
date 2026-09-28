<template>
  <div class="kyc-view section-dark">
    <div class="container py-12">
      <!-- Step Tracker Progress Bar -->
      <KYCStepTracker />

      <!-- Step 1: Personal Details Form -->
      <KYCPersonalForm v-if="currentStep === STEPS.KYC_PERSONAL" />

      <!-- Step 2: Document Upload Drag-and-Drop Zone -->
      <KYCDocumentUpload v-else-if="currentStep === STEPS.KYC_DOCUMENTS" />

      <!-- Step 3: Circular Liveness Selfie Check -->
      <KYCLivenessCheck v-else-if="currentStep === STEPS.KYC_LIVENESS" />

      <!-- Step 4: Verification Success Summary -->
      <KYCSuccessSummary v-else-if="currentStep === STEPS.KYC_COMPLETE" />
    </div>
  </div>
</template>

<script setup>
import { useAuthKYC } from '@/composables/useAuthKYC.js';
import KYCStepTracker from '@/components/kyc/KYCStepTracker.vue';
import KYCPersonalForm from '@/components/kyc/KYCPersonalForm.vue';
import KYCDocumentUpload from '@/components/kyc/KYCDocumentUpload.vue';
import KYCLivenessCheck from '@/components/kyc/KYCLivenessCheck.vue';
import KYCSuccessSummary from '@/components/kyc/KYCSuccessSummary.vue';

const { currentStep, STEPS } = useAuthKYC();
</script>

<style scoped>
.kyc-view {
  min-height: calc(100vh - 160px);
}
.py-12 {
  padding-top: 48px;
  padding-bottom: 64px;
}
</style>
