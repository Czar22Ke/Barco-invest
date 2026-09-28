<template>
  <div class="kyc-step-card glass-card">
    <div class="step-header">
      <h3 class="step-title">Step 2: Identity Document Verification</h3>
      <p class="step-subtitle">Select document type and upload a clear scan or photograph.</p>
    </div>

    <!-- Document Type Selector -->
    <div class="doc-type-selector mb-6">
      <button 
        type="button" 
        class="doc-type-btn" 
        :class="{ active: documentData.docType === 'PASSPORT' }"
        @click="documentData.docType = 'PASSPORT'"
      >
        <span>📘</span> Passport
      </button>

      <button 
        type="button" 
        class="doc-type-btn" 
        :class="{ active: documentData.docType === 'NATIONAL_ID' }"
        @click="documentData.docType = 'NATIONAL_ID'"
      >
        <span>🪪</span> National ID
      </button>

      <button 
        type="button" 
        class="doc-type-btn" 
        :class="{ active: documentData.docType === 'DRIVERS_LICENSE' }"
        @click="documentData.docType = 'DRIVERS_LICENSE'"
      >
        <span>💳</span> Driver's License
      </button>
    </div>

    <!-- Drag & Drop Zone -->
    <div 
      class="dropzone-container"
      :class="{ 
        'drag-active': isDragActive, 
        'uploading': isUploading, 
        'success': isSuccess 
      }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInputRef" 
        type="file" 
        class="hidden-file-input" 
        accept="image/*,application/pdf"
        @change="onFileSelected"
      />

      <!-- UI State 1: Idle / Drag Active -->
      <div v-if="!isUploading && !isSuccess" class="dropzone-idle">
        <div class="upload-icon">📄</div>
        <h4 class="dropzone-title">
          {{ isDragActive ? 'Drop Identity Document Here' : 'Drag & Drop Document File' }}
        </h4>
        <p class="dropzone-subtitle">Supports PNG, JPG, or PDF (Max 10MB)</p>
        <button type="button" class="btn-browse-file">Browse Files</button>
      </div>

      <!-- UI State 2: Uploading -->
      <div v-else-if="isUploading" class="dropzone-uploading">
        <div class="spinner-lg"></div>
        <h4 class="dropzone-title mt-4">Encrypting & Uploading Document...</h4>
        <p class="dropzone-subtitle">Transmitting securely to institutional verification service</p>
      </div>

      <!-- UI State 3: Success / Preview -->
      <div v-else-if="isSuccess" class="dropzone-success">
        <div class="success-icon">✅</div>
        <div class="file-preview-card">
          <img v-if="documentData.previewUrl" :src="documentData.previewUrl" alt="Doc Preview" class="doc-thumbnail" />
          <div class="file-info">
            <span class="file-name">{{ uploadedFileInfo.name }}</span>
            <span class="file-size text-muted">{{ uploadedFileInfo.size }} • {{ documentData.docType }}</span>
            <span class="badge badge-online mt-1">Uploaded & Encrypted</span>
          </div>
        </div>
        <button type="button" class="btn-replace" @click.stop="resetUpload">Upload Different Document</button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-helper text-center mt-3">
      {{ errorMessage }}
    </div>

    <!-- Navigation Action Buttons -->
    <div class="form-actions mt-6 flex-between">
      <button type="button" class="btn-secondary" @click="goToStep(STEPS.KYC_PERSONAL)">
        &larr; Back to Step 1
      </button>

      <button type="button" class="btn-cta-blue" :disabled="!isSuccess" @click="handleNext">
        Next: Liveness Check &rarr;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthKYC } from '@/composables/useAuthKYC.js';
import { uploadKYCDocument } from '@/services/authApi.js';

const { STEPS, documentData, goToStep } = useAuthKYC();

const fileInputRef = ref(null);
const isDragActive = ref(false);
const isUploading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref('');

const uploadedFileInfo = reactive({
  name: '',
  size: ''
});

function triggerFileInput() {
  if (isUploading.value || isSuccess.value) return;
  fileInputRef.value.click();
}

function onDragOver() {
  isDragActive.value = true;
}

function onDragLeave() {
  isDragActive.value = false;
}

function onDrop(e) {
  isDragActive.value = false;
  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    processUpload(files[0]);
  }
}

function onFileSelected(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processUpload(files[0]);
  }
}

async function processUpload(file) {
  errorMessage.value = '';
  isUploading.value = true;
  isSuccess.value = false;

  try {
    const res = await uploadKYCDocument(file, documentData.docType);
    documentData.uploadedFile = file;
    documentData.previewUrl = res.previewUrl;
    documentData.docId = res.docId;
    uploadedFileInfo.name = res.fileName;
    uploadedFileInfo.size = res.fileSize;
    isSuccess.value = true;
  } catch (err) {
    errorMessage.value = err.message || 'File upload failed.';
  } finally {
    isUploading.value = false;
  }
}

function resetUpload() {
  isSuccess.value = false;
  documentData.uploadedFile = null;
  documentData.previewUrl = '';
  documentData.docId = '';
}

function handleNext() {
  if (!isSuccess.value) return;
  goToStep(STEPS.KYC_LIVENESS);
}
</script>

<style scoped>
.kyc-step-card {
  max-width: 720px;
  margin: 0 auto;
  border-color: rgba(56, 189, 248, 0.2);
}

.step-header { margin-bottom: 24px; }
.step-title { font-size: 1.35rem; font-weight: 700; color: var(--text-dark-theme); margin-bottom: 6px; }
.step-subtitle { color: var(--text-dark-muted); font-size: 0.9rem; }

.mb-6 { margin-bottom: 24px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.hidden-file-input { display: none; }

/* Doc Type Selector */
.doc-type-selector {
  display: flex;
  gap: 12px;
}

.doc-type-btn {
  flex: 1;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--bg-dark-border);
  color: var(--text-dark-muted);
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.doc-type-btn.active {
  background: var(--primary-glow);
  border-color: #38bdf8;
  color: #38bdf8;
}

/* Drag & Drop Zone Component */
.dropzone-container {
  border: 2px dashed var(--bg-dark-border);
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone-container:hover,
.dropzone-container.drag-active {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
}

.dropzone-container.success {
  border-style: solid;
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.upload-icon { font-size: 2.8rem; margin-bottom: 12px; }
.dropzone-title { font-size: 1.1rem; font-weight: 700; color: var(--text-dark-theme); margin-bottom: 4px; }
.dropzone-subtitle { font-size: 0.85rem; color: var(--text-dark-muted); margin-bottom: 16px; }

.btn-browse-file {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--bg-dark-border);
  color: var(--text-dark-theme);
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.spinner-lg {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(56, 189, 248, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.8s linear infinite;
}

.file-preview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(15, 23, 42, 0.8);
  padding: 12px 18px;
  border-radius: 8px;
  max-width: 420px;
  margin: 16px auto;
  text-align: left;
}

.doc-thumbnail {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name { font-weight: 600; font-size: 0.9rem; color: var(--text-dark-theme); }
.file-size { font-size: 0.775rem; color: var(--text-dark-muted); }

.btn-replace {
  background: none;
  border: none;
  color: var(--text-dark-muted);
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
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
}

.btn-cta-blue:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
