<template>
  <div class="register-view section-dark">
    <div class="container py-12 flex-center">
      <div class="glass-card auth-card">
        <div class="auth-header text-center mb-6">
          <div class="brand-icon mb-2">💎</div>
          <h2 class="auth-title">Register Institutional Account</h2>
          <p class="auth-subtitle">Select your investment tier and set up client access credentials.</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form" novalidate>
          <!-- Email Input -->
          <div class="form-group mb-4">
            <label class="form-label" for="reg-email">Institutional Email</label>
            <input 
              id="reg-email" 
              v-model.trim="email" 
              type="email" 
              class="form-input" 
              placeholder="client@institutional.com" 
              required 
            />
          </div>

          <!-- Password Input -->
          <div class="form-group mb-4">
            <label class="form-label" for="reg-password">Password</label>
            <div class="relative flex items-center">
              <input 
                id="reg-password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                class="form-input w-full pr-10" 
                :class="{ 'input-error': passwordError }"
                placeholder="••••••••••••" 
                required 
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute right-3 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                tabindex="-1"
                aria-label="Toggle password visibility"
              >
                <!-- Eye slash (when password visible) -->
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <!-- Eye (when password hidden) -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <span v-if="passwordError" class="error-helper text-red-500 text-xs mt-1">{{ passwordError }}</span>
          </div>

          <!-- Selected Tier Selector Component Payload -->
          <div class="form-group mb-6">
            <label class="form-label">Select Registered Investment Tier</label>
            <div class="tier-select-grid">
              <div 
                v-for="tier in tiers" 
                :key="tier.id" 
                class="tier-option-card"
                :class="{ active: selectedTier === tier.id }"
                @click="selectedTier = tier.id"
              >
                <div class="tier-option-header">
                  <span class="tier-option-name">{{ tier.name }}</span>
                  <span class="tier-option-price">${{ tier.minDeposit }}</span>
                </div>
                <span class="tier-option-sub">{{ tier.alloc }}</span>
              </div>
            </div>
          </div>

          <button type="submit" class="btn-cta-blue" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Finalize Tier Deposit & Register &rarr;</span>
          </button>
        </form>

        <div class="auth-footer text-center mt-6">
          <p class="text-muted text-sm">
            Already registered? 
            <router-link to="/login" class="link-primary">Client Sign In</router-link>
          </p>
        </div>
      </div>
    </div>

    <div v-if="showGateway" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold text-white mb-2">Secure Checkout</h3>
        <p class="text-sm text-slate-400 mb-6">Initial funding required for <strong>{{ form.tier }}</strong> tier: <strong class="text-white">${{ tierMinimums[form.tier.toUpperCase()] }}</strong>.</p>
        <button @click="processInitialDeposit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2">
          <span v-if="isProcessingGateway" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isProcessingGateway ? 'Processing Payment...' : 'Simulate Successful Payment' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { depositFunds } from '../services/transactions'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const passwordError = ref('')
const selectedTier = ref('BRONZE') // Bind this to your tier selection inputs
const isLoading = ref(false)

const showGateway = ref(false);
const isProcessingGateway = ref(false);
const tierMinimums = { BRONZE: 500, SILVER: 1000, GOLD: 5000, INSTITUTIONAL: 15000 };

const form = computed(() => ({
  email: email.value,
  password: password.value,
  tier: selectedTier.value
}));

const tiers = [
  { id: 'BRONZE', name: 'BRONZE', minDeposit: '500.00', alloc: '70% Fiat / 30% BTC' },
  { id: 'SILVER', name: 'SILVER', minDeposit: '1,000.00', alloc: '60% Fiat / 40% BTC' },
  { id: 'GOLD', name: 'GOLD', minDeposit: '5,000.00', alloc: '50% Fiat / 30% BTC / 20% Private Credit' },
  { id: 'INSTITUTIONAL', name: 'INSTITUTIONAL', minDeposit: '15,000.00', alloc: '70% Fiat / 30% BTC' }
]

const validatePassword = (pwd) => {
  if (!pwd || pwd.length < 8) return 'Password must be at least 8 characters long.';
  if (!/\d/.test(pwd) || !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
    return 'Password must include at least one number and one special character.';
  }
  return '';
};

const handleRegister = async () => {
  passwordError.value = validatePassword(password.value);
  if (passwordError.value) return; // Halt submission

  isLoading.value = true;
  try {
    // Calls the existing function in auth.js
    await authStore.register(email.value, password.value, selectedTier.value);
    showGateway.value = true;
  } catch (err) {
    passwordError.value = err.message || 'Registration failed';
  } finally {
    isLoading.value = false;
  }
}

const processInitialDeposit = async () => {
  isProcessingGateway.value = true;
  await new Promise(resolve => setTimeout(resolve, 1500));
  try {
    const amount = tierMinimums[form.value.tier.toUpperCase()] || 500;
    await depositFunds(amount);
    showGateway.value = false;
    router.push('/dashboard');
  } catch (err) {
    alert(err.message || 'Initial funding failed. Please contact support.');
  } finally {
    isProcessingGateway.value = false;
  }
};
</script>

<style scoped>
.register-view {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
}

.py-12 { padding-top: 48px; padding-bottom: 64px; }
.flex-center { display: flex; justify-content: center; width: 100%; }

.auth-card {
  max-width: 520px;
  width: 100%;
  border-color: rgba(56, 189, 248, 0.3);
}

.brand-icon { font-size: 2.2rem; }
.auth-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark-theme); margin-bottom: 6px; }
.auth-subtitle { font-size: 0.875rem; color: var(--text-dark-muted); }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--text-dark-theme); }

.form-input {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--bg-dark-border);
  color: var(--text-dark-theme);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
}

.form-input:focus {
  outline: none;
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

.form-input.input-error { border-color: #ef4444; }
.error-helper { font-size: 0.775rem; color: #ef4444; }

.tier-select-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 4px;
}

.tier-option-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--bg-dark-border);
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.tier-option-card:hover {
  border-color: #38bdf8;
}

.tier-option-card.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
}

.tier-option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dark-theme);
}

.tier-option-price {
  color: #38bdf8;
  font-size: 0.8rem;
}

.tier-option-sub {
  font-size: 0.725rem;
  color: var(--text-dark-muted);
  margin-top: 4px;
}

.btn-cta-blue {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
}

.link-primary { color: #38bdf8; font-weight: 600; }
.link-primary:hover { text-decoration: underline; }
</style>
