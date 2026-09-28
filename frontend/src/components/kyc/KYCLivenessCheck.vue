<template>
  <div class="kyc-step-card glass-card">
    <div class="step-header">
      <h3 class="step-title">Step 3: Biometric Liveness Verification</h3>
      <p class="step-subtitle">Position your face within the circular camera frame and ensure good lighting.</p>
    </div>

    <!-- Circular Camera Framing Overlay Component -->
    <div class="camera-viewport-container">
      <div class="camera-circular-frame" :class="{ 'captured': isCaptured, 'verifying': isVerifying }">
        <!-- Live Video Feed / Captured Selfie Image -->
        <div v-if="!isCaptured" class="webcam-placeholder">
          <div class="view-grid"></div>
          <span class="user-silhouette">👤</span>
          <span class="pulse-dot-camera"></span>
        </div>

        <img v-else :src="capturedPhotoUrl" alt="Liveness Capture" class="captured-preview" />

        <!-- Circular Overlay Ring -->
        <div class="overlay-ring"></div>
        <div class="camera-status-tag">
          <span v-if="!isCaptured">Align Face Here</span>
          <span v-else-if="isVerifying">Analyzing Biometrics...</span>
          <span v-else>Biometrics Matched ✅</span>
        </div>
      </div>
    </div>

    <div class="liveness-instructions mt-4 text-center">
      <p v-if="!isCaptured" class="text-muted text-sm">
        Click "Capture Snapshot" to take a live selfie for instant 3D face verification.
      </p>
      <p v-else class="text-success text-sm font-semibold">
        Biometric liveness snapshot captured successfully.
      </p>
    </div>

    <!-- Navigation Action Buttons -->
    <div class="form-actions mt-6 flex-between">
      <button type="button" class="btn-secondary" @click="goToStep(STEPS.KYC_DOCUMENTS)">
        &larr; Back to Step 2
      </button>

      <button v-if="!isCaptured" type="button" class="btn-cta-blue" @click="handleCapture">
        📷 Capture Snapshot
      </button>

      <button v-else type="button" class="btn-cta-blue" :disabled="isVerifying" @click="handleSubmit">
        <span v-if="isVerifying" class="spinner"></span>
        <span v-else>Submit & Complete Verification &rarr;</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthKYC } from '@/composables/useAuthKYC.js';
import { submitKYCLiveness } from '@/services/authApi.js';

const { STEPS, livenessData, isKycVerified, goToStep } = useAuthKYC();

const isCaptured = ref(false);
const isVerifying = ref(false);
const capturedPhotoUrl = ref('');

function handleCapture() {
  // Simulate capturing webcam frame
  capturedPhotoUrl.value = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  isCaptured.value = true;
  livenessData.capturedImage = capturedPhotoUrl.value;
}

async function handleSubmit() {
  isVerifying.value = true;
  try {
    const res = await submitKYCLiveness(livenessData.capturedImage);
    if (res.success) {
      isKycVerified.value = true;
      goToStep(STEPS.KYC_COMPLETE);
    }
  } catch (err) {
    console.error('Liveness verification error:', err);
  } finally {
    isVerifying.value = false;
  }
}
</script>

<style scoped>
.kyc-step-card {
  max-width: 720px;
  margin: 0 auto;
  border-color: rgba(56, 189, 248, 0.2);
}

.step-header { margin-bottom: 24px; text-align: center; }
.step-title { font-size: 1.35rem; font-weight: 700; color: var(--text-dark-theme); margin-bottom: 6px; }
.step-subtitle { color: var(--text-dark-muted); font-size: 0.9rem; }

.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.text-center { text-align: center; }
.text-sm { font-size: 0.85rem; }
.text-muted { color: var(--text-dark-muted); }
.text-success { color: var(--success); }
.font-semibold { font-weight: 600; }

/* Circular Camera Framing Overlay Component */
.camera-viewport-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.camera-circular-frame {
  position: relative;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  overflow: hidden;
  background: #0f172a;
  border: 4px solid #38bdf8;
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.camera-circular-frame.captured {
  border-color: #10b981;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

.webcam-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: radial-gradient(circle, #1e293b 0%, #0f172a 100%);
}

.user-silhouette {
  font-size: 5rem;
  opacity: 0.4;
}

.pulse-dot-camera {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 10px #ef4444;
  animation: pulse 1.5s infinite;
}

.captured-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  pointer-events: none;
}

.camera-status-tag {
  position: absolute;
  bottom: 12px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

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
  font-size: 1rem;
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cta-blue:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
