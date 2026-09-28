<template>
  <div class="kyc-step-card glass-card">
    <div class="step-header">
      <h3 class="step-title">Step 1: Legal Personal Information</h3>
      <p class="step-subtitle">Provide your full legal details as shown on your government ID documents.</p>
    </div>

    <form @submit.prevent="handleNext" class="kyc-form" novalidate>
      <div class="grid-2">
        <!-- Legal First Name -->
        <div class="form-group">
          <label class="form-label" for="firstName">Legal First Name *</label>
          <input 
            id="firstName" 
            v-model.trim="personalData.firstName" 
            type="text" 
            class="form-input" 
            :class="{ 'input-error': errors.firstName }"
            placeholder="John"
            @blur="validateField('firstName')"
          />
          <span v-if="errors.firstName" class="error-helper">{{ errors.firstName }}</span>
        </div>

        <!-- Legal Last Name -->
        <div class="form-group">
          <label class="form-label" for="lastName">Legal Last Name *</label>
          <input 
            id="lastName" 
            v-model.trim="personalData.lastName" 
            type="text" 
            class="form-input" 
            :class="{ 'input-error': errors.lastName }"
            placeholder="Doe"
            @blur="validateField('lastName')"
          />
          <span v-if="errors.lastName" class="error-helper">{{ errors.lastName }}</span>
        </div>
      </div>

      <div class="grid-2 mt-4">
        <!-- Date of Birth -->
        <div class="form-group">
          <label class="form-label" for="dob">Date of Birth *</label>
          <input 
            id="dob" 
            v-model="personalData.dateOfBirth" 
            type="date" 
            class="form-input" 
            :class="{ 'input-error': errors.dateOfBirth }"
            @blur="validateField('dateOfBirth')"
          />
          <span v-if="errors.dateOfBirth" class="error-helper">{{ errors.dateOfBirth }}</span>
        </div>

        <!-- Country -->
        <div class="form-group">
          <label class="form-label" for="country">Country of Residence *</label>
          <select id="country" v-model="personalData.country" class="form-input">
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Singapore">Singapore</option>
          </select>
        </div>
      </div>

      <!-- Residential Address -->
      <div class="form-group mt-4">
        <label class="form-label" for="address">Full Residential Address *</label>
        <input 
          id="address" 
          v-model.trim="personalData.address" 
          type="text" 
          class="form-input" 
          :class="{ 'input-error': errors.address }"
          placeholder="100 Financial Center Blvd, Suite 400"
          @blur="validateField('address')"
        />
        <span v-if="errors.address" class="error-helper">{{ errors.address }}</span>
      </div>

      <!-- CTA Action Button -->
      <div class="form-actions mt-6">
        <button type="submit" class="btn-cta-blue" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Next: Document Upload &rarr;</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthKYC } from '@/composables/useAuthKYC.js';
import { submitKYCPersonalData } from '@/services/authApi.js';

const { STEPS, personalData, goToStep } = useAuthKYC();
const isLoading = ref(false);

const errors = reactive({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  address: ''
});

function validateField(field) {
  if (field === 'firstName') {
    errors.firstName = !personalData.firstName ? 'Legal first name is required.' : '';
  }
  if (field === 'lastName') {
    errors.lastName = !personalData.lastName ? 'Legal last name is required.' : '';
  }
  if (field === 'dateOfBirth') {
    errors.dateOfBirth = !personalData.dateOfBirth ? 'Date of birth is required.' : '';
  }
  if (field === 'address') {
    errors.address = !personalData.address ? 'Residential address is required.' : '';
  }
}

async function handleNext() {
  validateField('firstName');
  validateField('lastName');
  validateField('dateOfBirth');
  validateField('address');

  if (errors.firstName || errors.lastName || errors.dateOfBirth || errors.address) return;

  isLoading.value = true;
  try {
    await submitKYCPersonalData(personalData);
    goToStep(STEPS.KYC_DOCUMENTS);
  } catch (err) {
    console.error('Personal data submission error:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.kyc-step-card {
  max-width: 720px;
  margin: 0 auto;
  border-color: rgba(56, 189, 248, 0.2);
}

.step-header {
  margin-bottom: 24px;
}

.step-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-dark-theme);
  margin-bottom: 6px;
}

.step-subtitle {
  color: var(--text-dark-muted);
  font-size: 0.9rem;
}

.kyc-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }

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

.form-input.input-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.error-helper {
  font-size: 0.775rem;
  color: #ef4444;
  font-weight: 500;
}

.btn-cta-blue {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  transition: transform 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.btn-cta-blue:hover {
  transform: translateY(-1px);
}
</style>
