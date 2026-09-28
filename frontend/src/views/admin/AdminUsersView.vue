<template>
  <div class="admin-users-view">
    <div class="glass-card">
      <div class="card-header flex-between mb-4">
        <div>
          <h3 class="card-title">User Account Directory</h3>
          <p class="text-muted text-sm">Client account tiers, onboarding statuses, and registered allocation strategies.</p>
        </div>
        <span class="badge badge-admin">{{ users.length }} Users Registered</span>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Client Name</th>
              <th>Email</th>
              <th>Assigned Tier</th>
              <th>Status</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.userId">
              <td class="font-mono">{{ user.userId }}</td>
              <td><strong>{{ user.name }}</strong></td>
              <td class="text-muted">{{ user.email }}</td>
              <td><span class="badge badge-tier">{{ user.tier }}</span></td>
              <td>
                <span :class="['badge', user.status === 'Active' ? 'badge-online' : 'badge-warning']">
                  {{ user.status }}
                </span>
              </td>
              <td class="text-muted font-mono">{{ user.joined }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAdminUsers } from '@/services/adminApi.js';

const users = ref([]);

onMounted(async () => {
  users.value = await fetchAdminUsers();
});
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.text-muted { color: var(--text-dark-muted); }
.text-sm { font-size: 0.85rem; }
.font-mono { font-family: monospace; }
.card-title { font-size: 1.15rem; font-weight: 700; color: var(--text-dark-theme); }

.badge-admin {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
</style>
