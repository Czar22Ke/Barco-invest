<template>
  <div class="kyc-step-card glass-card text-center">
    <div class="success-badge-icon">🎉</div>
    <h2 class="success-title">Identity Verification Complete</h2>
    <p class="success-subtitle">
      Your institutional KYC verification has been processed and approved. Your client account is now fully authorized for high-volume portfolio allocations.
    </p>

    <!-- Verification Receipt -->
    <div class="summary-receipt">
      <div class="receipt-row flex-between">
        <span class="text-muted">Account Holder:</span>
        <strong>{{ personalData.firstName }} {{ personalData.lastName }}</strong>
      </div>
      <div class="receipt-row flex-between">
        <span class="text-muted">Verification Status:</span>
        <span class="badge badge-online">VERIFIED INSTITUTIONAL</span>
      </div>
      <div class="receipt-row flex-between">
        <span class="text-muted">Assigned Tier:</span>
        <span class="badge badge-tier">INSTITUTIONAL TIER ($50,000+ Min)</span>
      </div>
      <div class="receipt-row flex-between">
        <span class="text-muted">Document Verified:</span>
        <span>{{ documentData.docType }} (Encrypted)</span>
      </div>
    </div>

    <div class="actions mt-6">
      <router-link to="/dashboard" class="btn-cta-blue">
        Launch Secure Portfolio Dashboard &rarr;
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useAuthKYC } from '@/composables/useAuthKYC.js';

const { personalData, documentData } = useAuthKYC();
</script>

<style scoped>
.kyc-step-card {
  max-width: 640px;
  margin: 0 auto;
  border-color: #10b981;
  box-shadow: 0 0 40px rgba(16, 185, 129, 0.15);
}

.text-center { text-align: center; }
.success-badge-icon { font-size: 3.5rem; margin-bottom: 12px; }
.success-title { font-size: 1.8rem; font-weight: 800; color: var(--text-dark-theme); margin-bottom: 8px; }
.success-subtitle { color: var(--text-dark-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 28px; }

.summary-receipt {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--bg-dark-border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.9rem;
  margin-bottom: 28px;
}

.receipt-row {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.receipt-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.text-muted { color: var(--text-dark-muted); }
.mt-6 { margin-top: 24px; }

.btn-cta-blue {
  display: inline-block;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff !important;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 32px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(2, 132, 199, 0.4);
  transition: transform 0.2s;
}

.btn-cta-blue:hover {
  transform: translateY(-2px);
}
</style>
