<template>
  <div class="public-layout">
    <!-- Institutional Header Navigation -->
    <Header />

    <!-- Main Content Outlet -->
    <main class="public-content">
      <router-view />
    </main>

    <!-- Global Footer -->
    <Footer />

    <!-- Floating Toast Notification System (Bottom-Right Viewport) -->
    <ToastContainer />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import ToastContainer from '@/components/ToastContainer.vue';
</script>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.public-header {
  height: 80px;
  border-bottom: 1px solid var(--bg-dark-border);
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
}

.header-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
  color: var(--text-dark-theme);
}

.brand-icon { font-size: 1.5rem; }
.highlight { color: var(--primary-light); }

.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  color: var(--text-dark-muted);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text-dark-theme);
  background: rgba(255, 255, 255, 0.05);
}

.btn-dashboard {
  background: linear-gradient(135deg, var(--primary), #0369a1);
  color: #fff !important;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 14px var(--primary-glow);
  transition: transform 0.2s;
}

.btn-dashboard:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.public-content { flex: 1; }

.public-footer {
  padding: 32px 0;
  border-top: 1px solid var(--bg-light-border);
  color: var(--text-light-muted);
  font-size: 0.85rem;
  background: #ffffff;
}

.footer-links { display: flex; gap: 24px; }
</style>
