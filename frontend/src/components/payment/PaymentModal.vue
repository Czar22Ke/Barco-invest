<template>
  <div v-if="isOpen" class="modal-backdrop">
    <div class="glass-card payment-modal">
      <!-- Modal Header -->
      <div class="modal-header flex-between mb-4">
        <h3 class="modal-title">Finalize {{ tierDetails.name }} Tier Selection</h3>
        <button class="modal-close-btn" @click="emit('cancel')">&times;</button>
      </div>

      <!-- Deposit Summary Banner -->
      <div class="deposit-summary-box mb-6">
        <div class="summary-label">Required Minimum Initial Deposit</div>
        <div class="summary-amount text-primary">${{ tierDetails.minDeposit }} USD</div>
        <div class="summary-sub text-muted">
          Allocated Fund Strategy: {{ tierDetails.alloc }}
        </div>
      </div>

      <!-- Payment Method Toggle -->
      <div class="payment-method-toggle mb-6">
        <button 
          type="button" 
          class="toggle-btn" 
          :class="{ active: paymentMethod === 'CRYPTO' }"
          @click="paymentMethod = 'CRYPTO'"
        >
          <span>⚡</span> Crypto Wallet Deposit
        </button>

        <button 
          type="button" 
          class="toggle-btn" 
          :class="{ active: paymentMethod === 'FIAT' }"
          @click="paymentMethod = 'FIAT'"
        >
          <span>🏦</span> Bank Wire Transfer (Fiat)
        </button>
      </div>

      <!-- Crypto Payment Instructions -->
      <div v-if="paymentMethod === 'CRYPTO'" class="payment-details-box mb-6">
        <label class="form-label mb-2">Deposit USDT / BTC to Custodial Address</label>
        <div class="copy-address-box font-mono">
          <span>0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
          <span class="copy-tag">COPY</span>
        </div>
        <p class="text-muted text-xs mt-2">
          Network: Ethereum (ERC-20) or Arbitrum One. Deposit will auto-verify upon 6 blockchain confirmations.
        </p>
      </div>

      <!-- Fiat Payment Instructions -->
      <div v-else class="payment-details-box mb-6">
        <label class="form-label mb-2">Institutional Wire Details</label>
        <div class="wire-info">
          <div><span class="text-muted">Beneficiary:</span> <strong>Institutional Platform LLC</strong></div>
          <div><span class="text-muted">Bank Name:</span> <strong>JPMorgan Chase Bank, N.A.</strong></div>
          <div><span class="text-muted">SWIFT / BIC:</span> <strong class="font-mono">CHASUS33XXX</strong></div>
          <div><span class="text-muted">Account Ref:</span> <strong class="font-mono">REF-{{ tierDetails.id }}-{{ Date.now().toString().slice(-6) }}</strong></div>
        </div>
      </div>

      <!-- Action Flow Buttons -->
      <div class="modal-actions flex-between">
        <button type="button" class="btn-secondary" @click="emit('cancel')">
          Cancel / Go Back
        </button>

        <button type="button" class="btn-cta-blue" :disabled="isSubmitting" @click="handleConfirm">
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else>Confirm Deposit & Complete &rarr;</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedTier: { type: String, default: 'INSTITUTIONAL' }
});

const emit = defineEmits(['confirm', 'cancel']);

const paymentMethod = ref('CRYPTO');
const isSubmitting = ref(false);

const tierConfigs = {
  BRONZE: { id: 'BRONZE', name: 'BRONZE', minDeposit: '500.00', alloc: '70% Fiat USD / 30% BTC' },
  SILVER: { id: 'SILVER', name: 'SILVER', minDeposit: '2,000.00', alloc: '50% Fiat / 30% BTC / 20% ETH' },
  GOLD: { id: 'GOLD', name: 'GOLD', minDeposit: '10,000.00', alloc: '30% Fiat / 40% BTC / 30% ETH' },
  INSTITUTIONAL: { id: 'INSTITUTIONAL', name: 'INSTITUTIONAL', minDeposit: '50,000.00', alloc: '20% Fiat / 50% BTC / 30% ETH' }
};

const tierDetails = computed(() => tierConfigs[props.selectedTier] || tierConfigs.INSTITUTIONAL);

async function handleConfirm() {
  isSubmitting.value = true;
  
  const pendingPayload = {
    selectedTier: props.selectedTier,
    depositAmount: tierDetails.value.minDeposit,
    paymentMethod: paymentMethod.value,
    paymentStatus: 'pending',
    timestamp: Date.now()
  };

  setTimeout(() => {
    isSubmitting.value = false;
    emit('confirm', pendingPayload);
  }, 600);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.payment-modal {
  max-width: 540px;
  width: 100%;
  border-color: #38bdf8;
  box-shadow: 0 25px 50px -12px rgba(2, 132, 199, 0.35);
}

.modal-title { font-size: 1.25rem; font-weight: 700; color: var(--text-dark-theme); }
.modal-close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-dark-muted); cursor: pointer; }

.deposit-summary-box {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--bg-dark-border);
  padding: 18px;
  border-radius: 10px;
  text-align: center;
}

.summary-label { font-size: 0.85rem; color: var(--text-dark-muted); margin-bottom: 4px; }
.summary-amount { font-size: 2rem; font-weight: 800; color: #38bdf8; margin-bottom: 4px; }
.summary-sub { font-size: 0.8rem; }

.payment-method-toggle {
  display: flex;
  gap: 12px;
}

.toggle-btn {
  flex: 1;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--bg-dark-border);
  color: var(--text-dark-muted);
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}

.payment-details-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px dashed var(--bg-dark-border);
  padding: 16px;
  border-radius: 8px;
}

.copy-address-box {
  background: #0f172a;
  border: 1px solid var(--bg-dark-border);
  padding: 10px 14px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-dark-theme);
}

.copy-tag { font-size: 0.7rem; font-weight: 800; color: #38bdf8; cursor: pointer; }

.wire-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
}

.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mt-2 { margin-top: 8px; }
.text-xs { font-size: 0.75rem; }
.text-muted { color: var(--text-dark-muted); }
.text-primary { color: #38bdf8; }
.font-mono { font-family: monospace; }

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dark-theme);
  border: 1px solid var(--bg-dark-border);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cta-blue {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
