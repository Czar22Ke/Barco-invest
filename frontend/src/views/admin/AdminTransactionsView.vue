<template>
  <div class="admin-transactions-view">
    <div class="glass-card">
      <div class="card-header flex-between mb-4">
        <div>
          <h3 class="card-title">Financial Transaction Approval Queue</h3>
          <p class="text-muted text-sm">Review, verify, and process pending client deposits and withdrawal payouts.</p>
        </div>
        <span class="badge badge-admin">{{ pendingCount }} Pending Approvals</span>
      </div>

      <!-- Paginated Transaction Data Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>TX ID</th>
              <th>User Name</th>
              <th>Selected Tier</th>
              <th>Type</th>
              <th>Amount ($)</th>
              <th>Date / Time</th>
              <th>Status</th>
              <th>Processing Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedTransactions.length === 0">
              <td colspan="8" class="text-center text-muted py-6">
                No transactions found in queue.
              </td>
            </tr>

            <tr v-for="tx in paginatedTransactions" :key="tx.txId">
              <td class="font-mono text-muted">{{ tx.txId }}</td>
              <td>
                <div class="user-cell">
                  <strong>{{ tx.userName }}</strong>
                  <span class="text-muted text-xs">{{ tx.email }}</span>
                </div>
              </td>
              <td><span class="badge badge-tier">{{ tx.tier }}</span></td>
              <td>
                <span :class="['type-badge', tx.type.toLowerCase()]">{{ tx.type }}</span>
              </td>
              <td class="font-mono font-bold">${{ tx.amount }}</td>
              <td class="text-muted font-mono text-xs">{{ tx.date }}</td>
              <td>
                <span :class="['badge', getStatusBadgeClass(tx.status)]">
                  {{ tx.status }}
                </span>
              </td>
              <td>
                <!-- Inline Approve & Reject Action Buttons for Pending Rows -->
                <div v-if="tx.status === 'Pending'" class="action-buttons-inline">
                  <button 
                    type="button" 
                    class="btn-action btn-approve"
                    :disabled="actionLoadingId === tx.txId"
                    @click="handleAction(tx.txId, 'Approved')"
                  >
                    ✔ Approve
                  </button>

                  <button 
                    type="button" 
                    class="btn-action btn-reject"
                    :disabled="actionLoadingId === tx.txId"
                    @click="handleAction(tx.txId, 'Rejected')"
                  >
                    ✖ Reject
                  </button>
                </div>

                <!-- Completed Status Indicator -->
                <span v-else class="text-muted text-xs font-mono">
                  Processed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination-footer flex-between mt-4">
        <span class="text-muted text-xs">
          Showing page {{ currentPage }} of {{ totalPages }} ({{ transactions.length }} total records)
        </span>
        <div class="pagination-buttons">
          <button class="btn-page" :disabled="currentPage === 1" @click="currentPage--">&larr; Prev</button>
          <button class="btn-page" :disabled="currentPage >= totalPages" @click="currentPage++">Next &rarr;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchAdminTransactions, updateTransactionStatus } from '@/services/adminApi.js';

const transactions = ref([]);
const currentPage = ref(1);
const pageSize = 5;
const actionLoadingId = ref(null);

const pendingCount = computed(() => {
  return transactions.value.filter(t => t.status === 'Pending').length;
});

const totalPages = computed(() => {
  return Math.ceil(transactions.value.length / pageSize) || 1;
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return transactions.value.slice(start, start + pageSize);
});

onMounted(async () => {
  transactions.value = await fetchAdminTransactions();
});

function getStatusBadgeClass(status) {
  if (status === 'Approved') return 'badge-online';
  if (status === 'Pending') return 'badge-warning';
  return 'badge-offline';
}

async function handleAction(txId, newStatus) {
  actionLoadingId.value = txId;
  try {
    const res = await updateTransactionStatus(txId, newStatus);
    if (res.success) {
      // Refetch transaction list
      transactions.value = await fetchAdminTransactions();
    }
  } catch (err) {
    console.error('Action error:', err);
  } finally {
    actionLoadingId.value = null;
  }
}
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.py-6 { padding-top: 24px; padding-bottom: 24px; }
.text-center { text-align: center; }
.text-muted { color: var(--text-dark-muted); }
.text-xs { font-size: 0.775rem; }
.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }
.card-title { font-size: 1.15rem; font-weight: 700; color: var(--text-dark-theme); }

.user-cell { display: flex; flex-direction: column; }

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

.type-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.type-badge.deposit { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.type-badge.withdrawal { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

/* Inline Action Buttons for Pending Rows */
.action-buttons-inline {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.775rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: transform 0.15s, opacity 0.15s;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-approve {
  background: #10b981;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-reject {
  background: #ef4444;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.pagination-footer {
  border-top: 1px solid var(--bg-dark-border);
  padding-top: 16px;
}

.pagination-buttons {
  display: flex;
  gap: 8px;
}

.btn-page {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--bg-dark-border);
  color: var(--text-dark-theme);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
