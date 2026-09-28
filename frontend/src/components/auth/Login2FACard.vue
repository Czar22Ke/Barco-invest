<template>
  <div class="auth-card-wrapper">
    <div class="glass-card auth-card">
      <!-- Card Header -->
      <div class="auth-card-header">
        <div class="auth-icon">🔐</div>
        <h2 class="auth-title">
          {{ is2FA ? 'Two-Factor Authentication' : 'Institutional Portal Login' }}
        </h2>
        <p class="auth-subtitle">
          {{ is2FA ? 'Enter the 6-digit verification code sent to your registered authenticator.' : 'Secure access for verified institutional investment clients.' }}
        </p>
      </div>

      <!-- Phase 1: Login Form (Email & Password) -->
      <form v-if="!is2FA" @submit.prevent="handleLogin" class="auth-form" novalidate>
        <!-- Email Input -->
        <div class="form-group">
          <label class="form-label" for="email">Institutional Email Address</label>
          <input 
            id="email" 
            v-model.trim="credentials.email" 
            type="email" 
            class="form-input" 
            :class="{ 'input-error': errors.email }"
            placeholder="client@institutional.com"
            @blur="validateEmail"
          />
          <span v-if="errors.email" class="error-helper">{{ errors.email }}</span>
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input 
            id="password" 
            v-model="credentials.password" 
            type="password" 
            class="form-input" 
            :class="{ 'input-error': errors.password }"
            placeholder="••••••••••••"
            @blur="validatePassword"
          />
          <span v-if="errors.password" class="error-helper">{{ errors.password }}</span>
        </div>

        <div v-if="serverError" class="alert alert-danger mb-4">
          {{ serverError }}
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-cta-blue" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Continue to 2FA &rarr;</span>
        </button>
      </form>

      <!-- Phase 2: 2FA 6-Digit OTP Form -->
      <form v-else @submit.prevent="handleVerify2FA" class="auth-form">
        <div class="form-group text-center">
          <label class="form-label">6-Digit Verification Code</label>
          <div class="otp-inputs-wrapper">
            <input 
              v-model="otpCode" 
              type="text" 
              maxlength="6" 
              class="form-input otp-input font-mono" 
              :class="{ 'input-error': errors.otp }"
              placeholder="123456"
              autofocus
            />
          </div>
          <span v-if="errors.otp" class="error-helper center">{{ errors.otp }}</span>
        </div>

        <div v-if="serverError" class="alert alert-danger mb-4">
          {{ serverError }}
        </div>

        <div class="otp-actions">
          <button type="submit" class="btn-cta-blue" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Verify & Continue to KYC &rarr;</span>
          </button>
          
          <button type="button" class="btn-text-back" @click="is2FA = false">
            &larr; Back to Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthKYC } from '@/composables/useAuthKYC.js';
import { loginUser, verify2FA } from '@/services/authApi.js';

const router = useRouter();
const { STEPS, credentials, otpCode, isAuthAuthenticated, goToStep } = useAuthKYC();

const is2FA = ref(false);
const isLoading = ref(false);
const serverError = ref('');

const errors = reactive({
  email: '',
  password: '',
  otp: ''
});

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!credentials.email) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(credentials.email)) {
    errors.email = 'Please enter a valid institutional email address.';
  } else {
    errors.email = '';
  }
}

function validatePassword() {
  if (!credentials.password) {
    errors.password = 'Password is required.';
  } else if (credentials.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else {
    errors.password = '';
  }
}

async function handleLogin() {
  validateEmail();
  validatePassword();

  if (errors.email || errors.password) return;

  isLoading.value = true;
  serverError.value = '';

  try {
    const res = await loginUser(credentials.email, credentials.password);
    if (res.require2FA) {
      is2FA.value = true;
    }
  } catch (err) {
    serverError.value = err.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
}

async function handleVerify2FA() {
  if (!otpCode.value || otpCode.value.length !== 6) {
    errors.otp = 'Please enter a valid 6-digit numeric OTP code.';
    return;
  }
  errors.otp = '';

  isLoading.value = true;
  serverError.value = '';

  try {
    const res = await verify2FA('TMP_TOK', otpCode.value);
    if (res.success) {
      isAuthAuthenticated.value = true;
      goToStep(STEPS.KYC_PERSONAL);
      router.push('/kyc');
    }
  } catch (err) {
    serverError.value = err.message || '2FA verification failed.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.auth-card-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 24px;
}

.auth-card {
  max-width: 460px;
  width: 100%;
  border-color: rgba(56, 189, 248, 0.3);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
}

.auth-card-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark-theme);
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: var(--text-dark-muted);
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dark-theme);
}

.form-input {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--bg-dark-border);
  color: var(--text-dark-theme);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

/* Error States: Red borders & helper text */
.form-input.input-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.error-helper {
  font-size: 0.775rem;
  color: #ef4444;
  font-weight: 500;
}

.error-helper.center {
  text-align: center;
  display: block;
  margin-top: 6px;
}

/* Primary Bright Blue Accent CTA Buttons */
.btn-cta-blue {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  transition: transform 0.2s, opacity 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.btn-cta-blue:hover:not(:disabled) {
  transform: translateY(-1px);
  opacity: 0.95;
}

.btn-cta-blue:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.otp-input {
  font-size: 1.8rem;
  letter-spacing: 0.3em;
  text-align: center;
  padding: 14px;
}

.otp-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-text-back {
  background: none;
  border: none;
  color: var(--text-dark-muted);
  font-size: 0.85rem;
  cursor: pointer;
  text-align: center;
}

.btn-text-back:hover {
  color: var(--text-dark-theme);
}

.alert-danger {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
