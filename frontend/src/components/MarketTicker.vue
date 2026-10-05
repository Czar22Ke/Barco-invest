<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const liveData = ref([]);
let pollingInterval;

const fetchMarketData = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/market/ticker`);
    if (res.ok) {
      liveData.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load market ticker data', err);
  }
};

onMounted(() => {
  fetchMarketData();
  // Refresh the UI every 60 seconds to sync with the backend cache
  pollingInterval = setInterval(fetchMarketData, 60000);
});

onUnmounted(() => {
  clearInterval(pollingInterval);
});
</script>

<template>
  <div class="bg-slate-50 dark:bg-[#090d16] border-t border-b border-slate-200 dark:border-sky-500/20 transition-colors duration-200 flex items-center overflow-hidden h-10">
    <div class="bg-slate-100 dark:bg-[#0f172a] text-blue-600 dark:text-sky-400 border-r border-slate-200 dark:border-slate-800 px-4 py-2 font-bold text-xs flex items-center gap-2 z-10 shadow-sm">
      <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      LIVE TICKER
    </div>
    
    <div class="flex-1 overflow-hidden relative">
      <!-- w-max forces the container to stretch to the full width of both groups -->
      <div class="flex w-max animate-marquee items-center h-full">
        
        <!-- Group 1: Original Data -->
        <div class="flex items-center">
          <template v-for="(item, index) in liveData" :key="'g1-' + index">
            <div v-if="item.isLabel" class="inline-flex items-center mx-4 px-3 py-1 bg-slate-200/50 dark:bg-white/10 rounded-md text-slate-700 dark:text-slate-300 font-bold text-xs tracking-wider">
              {{ item.title }}
            </div>
            <div v-else class="inline-flex items-center mx-4">
              <span class="text-slate-800 dark:text-slate-100 font-semibold mr-2">{{ item.symbol }}</span>
              <span class="text-blue-600 dark:text-sky-400 font-mono mr-2">${{ item.price }}</span>
              <span :class="item.isPositive ? 'text-emerald-500' : 'text-rose-500'" class="text-sm font-medium">
                {{ item.change }}%
              </span>
              <span class="text-slate-400 dark:text-slate-600 ml-6">•</span>
            </div>
          </template>
        </div>

        <!-- Group 2: Exact Duplicate for Seamless Looping -->
        <div class="flex items-center" aria-hidden="true">
          <template v-for="(item, index) in liveData" :key="'g2-' + index">
            <div v-if="item.isLabel" class="inline-flex items-center mx-4 px-3 py-1 bg-slate-200/50 dark:bg-white/10 rounded-md text-slate-700 dark:text-slate-300 font-bold text-xs tracking-wider">
              {{ item.title }}
            </div>
            <div v-else class="inline-flex items-center mx-4">
              <span class="text-slate-800 dark:text-slate-100 font-semibold mr-2">{{ item.symbol }}</span>
              <span class="text-blue-600 dark:text-sky-400 font-mono mr-2">${{ item.price }}</span>
              <span :class="item.isPositive ? 'text-emerald-500' : 'text-rose-500'" class="text-sm font-medium">
                {{ item.change }}%
              </span>
              <span class="text-slate-400 dark:text-slate-600 ml-6">•</span>
            </div>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-marquee {
  animation: marquee 35s linear infinite;
}
@keyframes marquee {
  0% { transform: translateX(0%); }
  /* Stop exactly halfway through the w-max container to perfectly overlap the duplicate */
  100% { transform: translateX(-50%); } 
}
</style>
