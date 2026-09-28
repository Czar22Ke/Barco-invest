<template>
  <div class="admin-overview-view">
    <div class="grid-3 mb-8">
      <div class="glass-card metric-card">
        <span class="text-muted text-sm">Total Volume Managed</span>
        <div class="metric-val text-primary">$12,450,000.00</div>
        <span class="text-success text-xs mt-2">↑ +14.2% this month</span>
      </div>

      <div class="glass-card metric-card">
        <span class="text-muted text-sm">Pending Approval Queue</span>
        <div class="metric-val text-warning">2 Requests</div>
        <router-link to="/admin/transactions" class="link-action mt-2">Process Queue &rarr;</router-link>
      </div>

      <div class="glass-card metric-card">
        <span class="text-muted text-sm">Active Client Accounts</span>
        <div class="metric-val">142 Accounts</div>
        <span class="text-muted text-xs mt-2">Institutional & Retail Tiers</span>
      </div>
    </div>

    <!-- Quick Action Banner -->
    <div class="glass-card flex-between">
      <div>
        <h3 class="card-title">Transaction Queue Approval Needed</h3>
        <p class="text-muted text-sm">2 pending deposit/withdrawal requests require manual administrative verification.</p>
      </div>
      <router-link to="/admin/transactions" class="btn-cta-blue">Open Transactions Queue</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.mb-8 { margin-bottom: 32px; }
.mt-2 { margin-top: 8px; }
.text-muted { color: var(--text-dark-muted); }
.text-sm { font-size: 0.85rem; }
.text-xs { font-size: 0.775rem; }
.text-primary { color: #38bdf8; }
.text-success { color: #10b981; }
.text-warning { color: #f59e0b; }

.metric-card { display: flex; flex-direction: column; }
.metric-val { font-size: 2rem; font-weight: 800; margin-top: 6px; }

.card-title { font-size: 1.1rem; font-weight: 700; color: var(--text-dark-theme); margin-bottom: 4px; }
.link-action { color: #38bdf8; font-weight: 600; font-size: 0.85rem; }

.btn-cta-blue {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #fff !important;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
}
</style>
