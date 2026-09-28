<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errors = ref({});

const handleLogin = async () => {
  errors.value = {};
  
  if (!email.value) {
    errors.value.email = 'Email address is required.';
    return;
  }
  if (!password.value) {
    errors.value.password = 'Password is required.';
    return;
  }

  isLoading.value = true;
  try {
    const data = await authStore.login(email.value, password.value);
    const userData = data.user || {};
    
    if (userData.role === 'SUPER_ADMIN' || userData.role === 'ADMIN') {
      router.push('/admin');
    } else if (userData.role === 'MODERATOR') {
      router.push('/moderator');
    } else {
      router.push('/dashboard');
    }
  } catch (err) {
    errors.value.general = err.message || 'Invalid credentials. Please verify your login details.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between items-center bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-white px-4 py-8 sm:py-12 transition-colors duration-200">
    
    <!-- Top Bar Navigation Link -->
    <div class="w-full max-w-md flex items-center justify-between">
      <router-link 
        to="/" 
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <span>&larr;</span> Back to Overview
      </router-link>

      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
        Portal Access
      </span>
    </div>

    <!-- Centered Card Container -->
    <div class="w-full max-w-md my-auto">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-200">
        
        <!-- Header Glow Accent Line -->
        <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        <!-- Brand Icon & Header -->
        <div class="text-center mb-6">
          <div class="text-3xl select-none mb-2">💎</div>
          <div class="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
            BARCO HOLDINGS
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Client Login
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Access your personalized portfolio dashboard and live yield tracking.
          </p>
        </div>

        <!-- General Error Alert -->
        <div 
          v-if="errors.general" 
          class="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2"
        >
          <span class="text-sm leading-none mt-0.5">⚠️</span>
          <span>{{ errors.general }}</span>
        </div>

        <!-- Login Form with Strict Autocomplete Disabling -->
        <form 
          @submit.prevent="handleLogin" 
          class="space-y-4" 
          autocomplete="off" 
          novalidate
        >
          <!-- Dummy Hidden Inputs to Block Browser Auto-Fill Engines -->
          <input type="text" style="display:none" aria-hidden="true" autocomplete="off" />
          <input type="password" style="display:none" aria-hidden="true" autocomplete="new-password" />

          <!-- Email Address Input -->
          <div class="space-y-1.5">
            <label for="client-email" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input 
              id="client-email" 
              name="client_identity_entry"
              v-model.trim="email" 
              type="email" 
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="client@institutional.com" 
              :class="[
                'w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors',
                errors.email 
                  ? 'border-rose-500 focus:border-rose-500' 
                  : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
              ]"
              required 
            />
            <p v-if="errors.email" class="text-[11px] font-semibold text-rose-500 mt-1">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password Input with Text/Emoji Visibility Toggle -->
          <div class="space-y-1.5">
            <label for="client-secret" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div class="relative flex items-center">
              <input 
                id="client-secret" 
                name="client_passcode_entry"
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                autocomplete="new-password"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                placeholder="••••••••••••" 
                :class="[
                  'w-full px-4 py-3 pr-11 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors',
                  errors.password 
                    ? 'border-rose-500 focus:border-rose-500' 
                    : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                ]"
                required 
              />
              <!-- Password Visibility Toggle (Text/Emoji Only - No SVGs) -->
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 text-base select-none transition-colors"
                tabindex="-1"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <p v-if="errors.password" class="text-[11px] font-semibold text-rose-500 mt-1">
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full mt-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span v-if="isLoading" class="font-medium">Authenticating...</span>
            <span v-else class="flex items-center gap-2">
              <span>Sign In &amp; Launch Dashboard</span>
              <span class="transform group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </span>
          </button>
        </form>

        <!-- Card Footer -->
        <div class="text-center mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account? 
            <router-link to="/register" class="font-bold text-blue-600 dark:text-sky-400 hover:underline ml-1">
              Register New Account
            </router-link>
          </p>
        </div>

      </div>
    </div>

    <!-- Bottom Footer Tagline -->
    <div class="text-center mt-6">
      <p class="text-[11px] text-slate-400 dark:text-slate-500">
        Institutional Grade Encryption &bull; AML/KYC Compliant &bull; &copy; 2026 Barco Holdings
      </p>
    </div>

  </div>
</template>
