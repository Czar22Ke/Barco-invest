<template>
  <div class="tier-dashboard-module">
    <div class="tier-banner glass-card mb-6">
      <div class="flex-between">
        <div>
          <div class="badge badge-tier">BRONZE TIER ACCOUNT</div>
          <h2 class="module-title mt-2">Bronze Portfolio Dashboard</h2>
          <p class="text-muted text-sm">Balanced starter allocation: 70% Fiat USD Pool / 30% Crypto BTC Pool. Min deposit $500.00.</p>
        </div>
        <div class="fee-badge font-mono">20.00% Performance Fee (Profits > HWM)</div>
      </div>
    </div>

    <!-- Allocations Bar -->
    <div class="glass-card mb-6">
      <h3 class="card-title mb-3">Bronze Fund Allocations</h3>
      <div class="allocation-bars">
        <div class="alloc-item mb-3">
          <div class="alloc-label flex-between mb-1">
            <span>Fiat USD Liquidity Pool</span>
            <span class="font-mono">70.00%</span>
          </div>
          <div class="bar-bg"><div class="bar-fill" style="width: 70%; background: #38bdf8;"></div></div>
        </div>

        <div class="alloc-item">
          <div class="alloc-label flex-between mb-1">
            <span>Crypto BTC Pool</span>
            <span class="font-mono">30.00%</span>
          </div>
          <div class="bar-bg"><div class="bar-fill" style="width: 30%; background: #f59e0b;"></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.mb-1 { margin-bottom: 4px; }
.mb-3 { margin-bottom: 12px; }
.mb-6 { margin-bottom: 24px; }
.mt-2 { margin-top: 8px; }
.text-muted { color: var(--text-dark-muted); }
.text-sm { font-size: 0.85rem; }
.font-mono { font-family: monospace; }

.module-title { font-size: 1.4rem; font-weight: 700; color: var(--text-dark-theme); }

.fee-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--bg-dark-border);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--primary-light);
}

.card-title { font-size: 1.1rem; font-weight: 600; color: var(--text-dark-theme); }

.bar-bg {
  width: 100%; height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden;
}

.bar-fill { height: 100%; border-radius: 4px; }
</style>
