import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Define the Node.js backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

export const useAuthStore = defineStore('auth', () => {
  // Session State
  const initialSession = JSON.parse(localStorage.getItem('user_session')) || null;
  const user = ref(initialSession);
  const token = ref(localStorage.getItem('user_token') || null);
  const accountTier = ref(initialSession?.tier || localStorage.getItem('user_tier') || null);
  const role = ref(localStorage.getItem('user_role') || 'user');
  const balance = ref(parseFloat(initialSession?.balance || initialSession?.currentBalance || 0));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => role.value === 'admin');
  const userTier = computed(() => accountTier.value || 'BRONZE');

  /**
   * Log in user via actual Backend API
   */
  async function login(email, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Hydrate Pinia Store State from actual PostgreSQL database response
      const activeTier = data.user.tier || data.user.tier_name;
      
      if (data.user) {
        data.user.balance = parseFloat(data.balance || data.currentBalance || data.user.balance || data.user.currentBalance || 0);
        balance.value = data.user.balance;
      }

      user.value = data.user;
      token.value = data.token;
      accountTier.value = activeTier;
      role.value = data.user.role || 'user';

      // Overwrite Local Storage Caches
      localStorage.setItem('user_session', JSON.stringify(data.user));
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_tier', activeTier);
      localStorage.setItem('user_role', role.value);

      return data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }

  /**
   * Register user via actual Backend API
   */
  async function register(email, password, selectedTier) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          tier: selectedTier || 'BRONZE'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const activeTier = data.user.tier;

      if (data.user) {
        data.user.balance = parseFloat(data.balance || data.currentBalance || data.user.balance || data.user.currentBalance || 0);
        balance.value = data.user.balance;
      }

      user.value = data.user;
      token.value = data.token;
      accountTier.value = activeTier;
      role.value = 'user';

      localStorage.setItem('user_session', JSON.stringify(data.user));
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_tier', activeTier);
      localStorage.setItem('user_role', 'user');

      return data;
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  }

  /**
   * Fetch current user profile from backend with latest ledger balance
   */
  async function fetchUser() {
    if (!token.value) return null;
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      });
      if (response.ok) {
        const responseData = await response.json();
        const userData = responseData.user || {};
        userData.balance = parseFloat(responseData.balance || responseData.currentBalance || userData.balance || userData.currentBalance || 0);
        user.value = userData;
        balance.value = userData.balance;
        localStorage.setItem('user_session', JSON.stringify(userData));
        return userData;
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
    return null;
  }

  /**
   * Log out and clear session state
   */
  function logout() {
    user.value = null;
    token.value = null;
    accountTier.value = null;
    role.value = 'user';
    balance.value = 0;

    localStorage.removeItem('user_session');
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_tier');
    localStorage.removeItem('user_role');
  }

  return {
    user,
    token,
    balance,
    accountTier,
    role,
    userTier,
    isAuthenticated,
    isAdmin,
    login,
    register,
    fetchUser,
    logout
  };
});
