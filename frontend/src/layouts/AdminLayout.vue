<template>
  <div class="admin-layout">
    <!-- Persistent Left-Hand Admin Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <span class="brand-icon">🛡️</span>
        <span class="brand-text">BARCO <span class="highlight">HOLDINGS</span></span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" exact-active-class="active">
          <span class="icon">📈</span>
          <span>Overview</span>
        </router-link>

        <router-link to="/admin/transactions" class="nav-item" active-class="active">
          <span class="icon">💸</span>
          <span>Transactions Queue</span>
        </router-link>

        <router-link to="/admin/users" class="nav-item" active-class="active">
          <span class="icon">👥</span>
          <span>User Management</span>
        </router-link>

        <router-link to="/" class="nav-item">
          <span class="icon">🌐</span>
          <span>Public Portal</span>
        </router-link>
      </nav>

      <div class="sidebar-footer glass-card-sm">
        <div class="user-info">
          <span class="user-title">System Administration</span>
          <span class="user-id">{{ authStore.user?.email || 'admin@system.local' }}</span>
        </div>
        <div class="badge badge-admin mt-2">SYS_ADMIN ROLE</div>
        <button class="btn-logout mt-3" @click="handleLogout">Sign Out &rarr;</button>
      </div>
    </aside>

    <!-- Main Admin Workspace -->
    <div class="main-wrapper">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <h2 class="page-title">Institutional Administration Portal</h2>
        </div>

        <div class="topbar-right">
          <div class="badge badge-admin">
            <span>FULL RBAC ACCESS</span>
          </div>

          <div class="socket-info font-mono">
            <span class="text-muted">Node.js Microservice Gateway: ONLINE</span>
          </div>
        </div>
      </header>

      <!-- View Outlet -->
      <main class="admin-content">
        <router-view />
      </main>

      <!-- Global Footer -->
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Footer from '@/components/Footer.vue';
import { useAuthStore } from '@/stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #090d16;
}

.admin-sidebar {
  width: 260px;
  background: #0f172a;
  border-right: 1px solid var(--bg-dark-border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1.15rem;
  margin-bottom: 32px;
  padding: 0 8px;
}

.brand-icon { font-size: 1.4rem; }
.highlight { color: #38bdf8; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  color: var(--text-dark-muted);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dark-theme);
}

.nav-item.active {
  border-left: 3px solid #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.sidebar-footer {
  margin-top: auto;
  border: 1px solid var(--bg-dark-border);
  padding: 12px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.8);
}

.user-info { display: flex; flex-direction: column; }
.user-title { font-size: 0.75rem; color: var(--text-dark-muted); }
.user-id { font-weight: 600; font-size: 0.85rem; color: var(--text-dark-theme); }

.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }

.badge-admin {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.btn-logout {
  width: 100%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 72px;
  border-bottom: 1px solid var(--bg-dark-border);
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.9);
}

.page-title { font-size: 1.1rem; font-weight: 700; color: var(--text-dark-theme); }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.socket-info { font-size: 0.8rem; }
.admin-content { padding: 32px; flex: 1; }
</style>
