<template>
  <footer class="global-footer bg-slate-50 dark:bg-[#040811] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 text-slate-500 dark:text-slate-400">
    <!-- Subtle Sine-Wave SVG Background Overlay -->
    <div class="sine-wave-bg" aria-hidden="true">
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" class="sine-wave-svg">
        <path 
          d="M0,100 C180,170 360,30 540,100 C720,170 900,30 1080,100 C1260,170 1440,30 1620,100" 
          fill="none" 
          stroke="currentColor" 
          class="text-slate-300/40 dark:text-slate-700/30"
          stroke-width="2" 
        />
        <path 
          d="M0,120 C200,40 400,180 600,100 C800,20 1000,180 1200,100 C1400,20 1600,160 1800,100" 
          fill="none" 
          stroke="currentColor" 
          class="text-blue-500/20 dark:text-sky-400/20"
          stroke-width="1.5" 
        />
      </svg>
    </div>

    <div class="footer-container">
      <!-- 5-Column Grid Layout -->
      <div class="footer-grid">
        
        <!-- Column 1: Brand & Contact -->
        <div class="footer-col col-brand">
          <router-link to="/" class="font-bold text-xl tracking-wide flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity mb-4">
            <span class="text-blue-500">💎</span> BARCO HOLDINGS
          </router-link>

          <div class="info-block mb-4">
            <h4 class="col-sub-header text-slate-900 dark:text-white font-semibold text-sm mb-2">Location to HQ</h4>
            <div class="info-item text-slate-500 dark:text-slate-400">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>9962 Kingsway GUILDFORD GU39 3IO</span>
            </div>
            <div class="info-item text-slate-500 dark:text-slate-400 mt-2">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>7:00 to 19:00 GMT 00</span>
            </div>
          </div>
        </div>

        <!-- Column 2: Customer Support -->
        <div class="footer-col">
          <h3 class="col-header text-slate-900 dark:text-white font-bold text-base mb-5">Customer support</h3>
          <ul class="footer-links-list">
            <li>
              <a href="mailto:support@barcoholdings.com" class="icon-link text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                <svg class="list-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Online Support</span>
              </a>
            </li>
            <li>
              <router-link to="/legal/privacy" class="icon-link text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                <svg class="list-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Privacy Policy</span>
              </router-link>
            </li>
            <li>
              <router-link to="/legal/terms" class="icon-link text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                <svg class="list-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Terms &amp; Condition</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Column 3: Quick Links -->
        <div class="footer-col">
          <h3 class="col-header text-slate-900 dark:text-white font-bold text-base mb-5">Quick Links</h3>
          <ul class="footer-links-list">
            <li>
              <router-link to="/login" class="text-link text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                Login
              </router-link>
            </li>
            <li>
              <router-link to="/register" class="text-link text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                Create account
              </router-link>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Mobile App</span>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Download our product</span>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Refer and earn</span>
            </li>
          </ul>
        </div>

        <!-- Column 4: Trading Guides -->
        <div class="footer-col">
          <h3 class="col-header text-slate-900 dark:text-white font-bold text-base mb-5">Trading guides</h3>
          <ul class="footer-links-list">
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">CFD trading guide</span>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Trading strategies guide</span>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Trading psychology guide</span>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">ETFs trading guide</span>
            </li>
          </ul>
        </div>

        <!-- Column 5: Markets -->
        <div class="footer-col">
          <h3 class="col-header text-slate-900 dark:text-white font-bold text-base mb-5">Markets</h3>
          <ul class="footer-links-list">
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Forex</span>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Indices</span>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Cryptocurrency</span>
            </li>
            <li>
              <span class="text-link opacity-50 cursor-not-allowed">Stock &amp; referal</span>
            </li>
          </ul>
        </div>

      </div>

      <!-- Sub-Footer Bottom Bar -->
      <div class="footer-bottom border-t border-slate-200 dark:border-slate-800/80 pt-6">
        <div class="bottom-flex">
          <p class="copyright-text text-slate-500 dark:text-slate-400 text-sm">&copy; 2026 Barco Holdings. All rights reserved.</p>
          <div class="bottom-badges">
            <span class="badge-tag bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400">Decoupled Architecture</span>
            <span class="badge-tag bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400">Institutional Compliance</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Global Footer Component
</script>

<style scoped>
.global-footer {
  position: relative;
  overflow: hidden;
  padding: 64px 0 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Horizontal Sine Wave Graphic Background */
.sine-wave-bg {
  position: absolute;
  top: 35%;
  left: 0;
  width: 100%;
  height: 200px;
  pointer-events: none;
  z-index: 0;
  transform: translateY(-50%);
}

.sine-wave-svg {
  width: 100%;
  height: 100%;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  position: relative;
  z-index: 1;
}

/* 5-Column Responsive Grid */
.footer-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 36px;
  margin-bottom: 48px;
}

.col-header {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.col-sub-header {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 1.4rem;
}

.company-name {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.icon-svg {
  width: 16px;
  height: 16px;
  color: #38bdf8;
  flex-shrink: 0;
  margin-top: 2px;
}

.social-block {
  margin-top: 16px;
}

.social-icons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.social-link:hover {
  transform: translateY(-2px);
}

.social-svg {
  width: 16px;
  height: 16px;
}

/* Links List */
.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.text-link, .icon-link {
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.icon-link {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-icon {
  width: 15px;
  height: 15px;
  color: #38bdf8;
  flex-shrink: 0;
}

/* Footer Bottom Bar */
.footer-bottom {
  padding-top: 24px;
}

.bottom-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright-text {
  font-size: 0.85rem;
  margin: 0;
}

.bottom-badges {
  display: flex;
  gap: 12px;
}

.badge-tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.mb-4 { margin-bottom: 16px; }
.mt-2 { margin-top: 8px; }

/* Responsive Media Queries */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .bottom-flex {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
