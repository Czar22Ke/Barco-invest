<template>
  <div class="forbidden-view section-dark flex-center">
    <div class="glass-card forbidden-card text-center">
      <div class="forbidden-icon">🚫</div>
      <h1 class="forbidden-title">403 - Access Forbidden</h1>
      <p class="forbidden-subtitle">
        You do not have administrative privileges (`role === 'admin'`) to access the system control panel.
      </p>

      <div class="actions mt-6 flex-center gap-4">
        <router-link to="/" class="btn-secondary">Return to Homepage</router-link>
        <router-link to="/login" class="btn-cta-blue">Sign In as Admin</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.forbidden-view {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.forbidden-card {
  max-width: 480px;
  width: 100%;
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
}

.text-center { text-align: center; }
.flex-center { display: flex; justify-content: center; }
.gap-4 { gap: 16px; }

.forbidden-icon { font-size: 3.5rem; margin-bottom: 12px; }
.forbidden-title { font-size: 1.8rem; font-weight: 800; color: #ef4444; margin-bottom: 8px; }
.forbidden-subtitle { color: var(--text-dark-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px; }

.mt-6 { margin-top: 24px; }

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dark-theme);
  border: 1px solid var(--bg-dark-border);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}

.btn-cta-blue {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff !important;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 8px;
}
</style>
