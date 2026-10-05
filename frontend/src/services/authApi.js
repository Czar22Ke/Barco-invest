/**
 * Asynchronous Authentication & KYC API Wrapper Service
 * 
 * Provides connection methods to decoupled Node.js auth and KYC microservices.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`;

/**
 * Simulates or executes authentication login.
 */
export async function loginUser(email, password) {
  // Scaffold fetch request to backend auth microservice
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password && password.length >= 8) {
        resolve({
          success: true,
          require2FA: true,
          tempToken: `TMP_TOK_${Date.now()}`,
          message: 'Primary authentication successful. 6-digit 2FA OTP sent.'
        });
      } else {
        reject(new Error('Invalid credentials. Password must be at least 8 characters.'));
      }
    }, 600);
  });
}

/**
 * Verifies 6-digit OTP 2FA code.
 */
export async function verify2FA(tempToken, otpCode, userTier = 'BRONZE') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otpCode && otpCode.length === 6) {
        const dynamicTier = userTier || 'BRONZE';
        resolve({
          success: true,
          authToken: `JWT_AUTH_${Date.now()}`,
          user: {
            userId: `USER_${Date.now().toString().slice(-4)}`,
            email: 'client@domain.com',
            tier: dynamicTier,
            kycStatus: 'PENDING'
          },
          accountTier: dynamicTier
        });
      } else {
        reject(new Error('Invalid 2FA OTP code. Please enter 6 numeric digits.'));
      }
    }, 500);
  });
}

/**
 * Submits KYC Step 1 Personal Information.
 */
export async function submitKYCPersonalData(personalData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        step: 1,
        message: 'Personal details saved successfully.'
      });
    }, 500);
  });
}

/**
 * Uploads KYC Identity Document (Passport / National ID / Driver's License).
 */
export async function uploadKYCDocument(file, docType) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!file) {
        reject(new Error('No file selected for upload.'));
        return;
      }
      resolve({
        success: true,
        docId: `DOC_${Date.now()}`,
        docType,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        previewUrl: URL.createObjectURL(file)
      });
    }, 1200);
  });
}

/**
 * Submits KYC Step 3 Liveness Selfie Capture.
 */
export async function submitKYCLiveness(imageBlob) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        verificationId: `VERIF_${Date.now()}`,
        kycStatus: 'VERIFIED',
        message: 'Liveness biometric verification passed.'
      });
    }, 1000);
  });
}
