<script setup>
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0b1325] dark:text-white transition-colors duration-200">
    
    <!-- 1. Header (Locks to top) -->
    <header class="sticky top-0 flex-none border-b border-slate-200 dark:border-slate-800 z-50 bg-white dark:bg-slate-950 transition-colors duration-200">
      <GlobalHeader />
    </header>

    <!-- 2. Middle Region (Fills remaining height, min-h-0 completely prevents overflow blowout) -->
    <div class="flex-1 min-h-0 flex flex-row w-full">
      
      <!-- Left Sidebar (Locks width, independent scroll) -->
      <aside class="w-[220px] flex-none h-full overflow-y-auto z-10 hidden md:block">
        <Sidebar />
      </aside>
      
      <!-- Right Main Content (Fills remaining width, independent scroll) -->
      <main class="flex-1 min-h-0 h-full bg-slate-50 dark:bg-[#0b1325] p-6 overflow-y-auto relative transition-colors duration-200">
        <router-view />
      </main>

    </div>

    <!-- 3. Footer (Locks to bottom, will not stretch or shrink) -->
    <footer class="flex-none border-t border-slate-200 dark:border-slate-800 z-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <GlobalFooter />
    </footer>

  </div>
</template>
