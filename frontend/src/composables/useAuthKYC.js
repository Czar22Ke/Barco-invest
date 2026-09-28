import { ref, reactive, computed } from 'vue';

// Onboarding Steps Sequence
export const STEPS = Object.freeze({
  LOGIN: 'LOGIN',
  OTP_2FA: 'OTP_2FA',
  KYC_PERSONAL: 'KYC_PERSONAL',
  KYC_DOCUMENTS: 'KYC_DOCUMENTS',
  KYC_LIVENESS: 'KYC_LIVENESS',
  KYC_COMPLETE: 'KYC_COMPLETE'
});

const currentStep = ref(STEPS.LOGIN);

const credentials = reactive({
  email: '',
  password: ''
});

const otpCode = ref('');

const personalData = reactive({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  address: '',
  city: '',
  country: 'United States'
});

const documentData = reactive({
  docType: 'PASSPORT',
  uploadedFile: null,
  previewUrl: '',
  docId: ''
});

const livenessData = reactive({
  capturedImage: null,
  verificationId: ''
});

const isAuthAuthenticated = ref(false);
const isKycVerified = ref(false);

const kycStepIndex = computed(() => {
  switch (currentStep.value) {
    case STEPS.KYC_PERSONAL: return 1;
    case STEPS.KYC_DOCUMENTS: return 2;
    case STEPS.KYC_LIVENESS: return 3;
    case STEPS.KYC_COMPLETE: return 3;
    default: return 0;
  }
});

export function useAuthKYC() {
  function goToStep(step) {
    currentStep.value = step;
  }

  function resetWizard() {
    currentStep.value = STEPS.LOGIN;
    credentials.email = '';
    credentials.password = '';
    otpCode.value = '';
    personalData.firstName = '';
    personalData.lastName = '';
    personalData.dateOfBirth = '';
    personalData.address = '';
    personalData.city = '';
    documentData.uploadedFile = null;
    documentData.previewUrl = '';
    documentData.docId = '';
    livenessData.capturedImage = null;
    isAuthAuthenticated.value = false;
    isKycVerified.value = false;
  }

  return {
    STEPS,
    currentStep,
    kycStepIndex,
    credentials,
    otpCode,
    personalData,
    documentData,
    livenessData,
    isAuthAuthenticated,
    isKycVerified,
    goToStep,
    resetWizard
  };
}
