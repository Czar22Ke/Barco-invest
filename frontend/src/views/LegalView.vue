<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GlobalHeader from '@/components/GlobalHeader.vue';
import Footer from '@/components/Footer.vue';

const route = useRoute();
const router = useRouter();

const docType = computed(() => {
  const param = (route.params.docType || 'privacy').toString().toLowerCase();
  return param === 'terms' || param === 'terms-and-conditions' ? 'terms' : 'privacy';
});

const selectDoc = (type) => {
  router.push(`/legal/${type}`);
};
</script>

<template>
  <div class="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-white transition-colors duration-200">
    <!-- Sticky Navigation Header -->
    <header class="sticky top-0 w-full z-50">
      <GlobalHeader />
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
      <!-- Breadcrumb & Back Link -->
      <div class="mb-6 flex items-center justify-between">
        <router-link 
          to="/" 
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Overview
        </router-link>

        <div class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          Institutional Compliance
        </div>
      </div>

      <!-- Legal Document Navigation Tabs -->
      <div class="flex items-center gap-3 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          @click="selectDoc('privacy')"
          :class="[
            'px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200',
            docType === 'privacy'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800'
          ]"
        >
          Privacy Policy
        </button>
        <button
          @click="selectDoc('terms')"
          :class="[
            'px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200',
            docType === 'terms'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800'
          ]"
        >
          Terms &amp; Conditions
        </button>
      </div>

      <!-- Document Content Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm transition-colors duration-200">
        
        <!-- PRIVACY POLICY VIEW -->
        <article v-if="docType === 'privacy'" class="space-y-8">
          <header class="border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Privacy Policy
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Last updated: September 2026 &bull; Reference: POL-AML-KYC-2026
            </p>
          </header>

          <!-- Section 1 (Verbatim Requirement) -->
          <section class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="text-blue-600 dark:text-sky-400">1.</span> Data Collection and Usage
            </h2>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We collect necessary information to maintain institutional compliance, secure your portfolio, and adhere to global AML/KYC regulations. Your data is encrypted and strictly used for platform functionality.
            </p>
          </section>

          <!-- Section 2 -->
          <section class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="text-blue-600 dark:text-sky-400">2.</span> Cryptographic Telemetry &amp; Storage Security
            </h2>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              All client cryptographic keys, transactional ledgers, and identity telemetry are isolated in encrypted persistence layers with hardware security module (HSM) attestation. Data access follows least-privilege administrative clearance protocols.
            </p>
          </section>

          <!-- Section 3 -->
          <section class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="text-blue-600 dark:text-sky-400">3.</span> Statutory Reporting &amp; Disclosure
            </h2>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Barco Holdings operates under strict international financial oversight. Information is submitted to regulatory authorities solely in compliance with binding statutory AML/CFT directives.
            </p>
          </section>

          <!-- Section 4 -->
          <section class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="text-blue-600 dark:text-sky-400">4.</span> Audit Inquiries
            </h2>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              For questions regarding regulatory disclosures or data protection verification, contact institutional compliance directly at <a href="mailto:support@barcoholdings.com" class="text-blue-600 dark:text-sky-400 font-medium hover:underline">support@barcoholdings.com</a>.
            </p>
          </section>
        </article>

        <!-- TERMS & CONDITIONS VIEW -->
        <article v-else class="space-y-8">
          <header class="border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Terms &amp; Conditions
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Last updated: September 2026 &bull; Reference: AGR-INST-2026
            </p>
          </header>

          <!-- Section 1 (Verbatim Requirement) -->
          <section class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="text-blue-600 dark:text-sky-400">1.</span> Account Terms and Capital Allocation
            </h2>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              By accessing the Barco Holdings platform, you agree to our capital lock-up periods and High-Water Mark (HWM) fee structures. Early withdrawals may be subject to administrative penalties.
            </p>
          </section>

          <!-- Section 2 -->
          <section class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="text-blue-600 dark:text-sky-400">2.</span> High-Water Mark (HWM) &amp; Performance Fee Math
            </h2>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Performance fees apply strictly to net new profit generated beyond the investor's verified High-Water Mark. Ledger balances ratcheting upward from yield distribution establish the new fee watermark baseline.
            </p>
          </section>

          <!-- Section 3 -->
          <section class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="text-blue-600 dark:text-sky-400">3.</span> Yield Harvesting &amp; NAV Settlement
            </h2>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Yield distributions execute on automated settlement schedules based on active tier strategies (Bronze, Silver, Gold, Institutional). All distributions are denominated in USD base currency.
            </p>
          </section>

          <!-- Section 4 -->
          <section class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="text-blue-600 dark:text-sky-400">4.</span> Risk Disclosure &amp; Market Volatility
            </h2>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Participation in digital asset and derivative liquidity pools involves market risk. Capital preservation algorithms optimize drawdown management but do not guarantee immunity from systemic asset volatility.
            </p>
          </section>
        </article>

      </div>
    </main>

    <!-- Global Footer -->
    <Footer />
  </div>
</template>
