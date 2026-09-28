<template>
  <div class="tier-dashboard-module">
    <div class="tier-banner glass-card mb-6 border-institutional">
      <div class="flex-between">
        <div>
          <div class="badge badge-online">INSTITUTIONAL TIER PREFERENTIAL ACCESS</div>
          <h2 class="module-title mt-2">Institutional Master Dashboard</h2>
          <p class="text-muted text-sm">Institutional allocation: 20% Fiat USD / 50% BTC / 30% ETH. Min deposit $50,000.00.</p>
        </div>
        <div class="fee-badge-highlight font-mono">10.00% Preferential Fee (Profits > HWM)</div>
      </div>
    </div>

    <!-- Allocations Bar -->
    <div class="glass-card mb-6">
      <h3 class="card-title mb-3">Institutional Fund Allocations</h3>
      <div class="allocation-bars">
        <div class="alloc-item mb-3">
          <div class="alloc-label flex-between mb-1">
            <span>Crypto BTC Institutional Pool</span>
            <span class="font-mono">50.00%</span>
          </div>
          <div class="bar-bg"><div class="bar-fill" style="width: 50%; background: #f59e0b;"></div></div>
        </div>

        <div class="alloc-item mb-3">
          <div class="alloc-label flex-between mb-1">
            <span>Crypto ETH Pool</span>
            <span class="font-mono">30.00%</span>
          </div>
          <div class="bar-bg"><div class="bar-fill" style="width: 30%; background: #a855f7;"></div></div>
        </div>

        <div class="alloc-item">
          <div class="alloc-label flex-between mb-1">
            <span>Fiat USD Liquidity Reserve</span>
            <span class="font-mono">20.00%</span>
          </div>
          <div class="bar-bg"><div class="bar-fill" style="width: 20%; background: #38bdf8;"></div></div>
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

.border-institutional {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.2);
}

.module-title { font-size: 1.4rem; font-weight: 800; color: #ffffff; }

.fee-badge-highlight {
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid #38bdf8;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #38bdf8;
  font-weight: 700;
}

.card-title { font-size: 1.1rem; font-weight: 600; color: var(--text-dark-theme); }

.bar-bg {
  width: 100%; height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden;
}

.bar-fill { height: 100%; border-radius: 4px; }
</style>
