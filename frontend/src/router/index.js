import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import InvestmentView from '../views/InvestmentView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
        { path: 'profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
        { path: 'investment', name: 'Investment', component: InvestmentView, meta: { requiresAuth: true } },
        { path: 'plans', name: 'plans', component: () => import('@/views/PlansView.vue'), meta: { requiresAuth: true } },
        { path: 'deposit', name: 'deposit', component: () => import('@/views/DepositView.vue'), meta: { requiresAuth: true } },
        { path: 'transactions', name: 'transactions', component: () => import('@/views/TransactionsView.vue'), meta: { requiresAuth: true } },
        { path: 'bronze', redirect: '/dashboard' },
        { path: 'silver', redirect: '/dashboard' },
        { path: 'gold', redirect: '/dashboard' },
        { path: 'institutional', redirect: '/dashboard' }
      ]
    },
    {
      path: '/plans',
      redirect: '/dashboard/plans'
    },
    {
      path: '/profile',
      redirect: '/dashboard/profile'
    },
    {
      path: '/investment',
      redirect: '/dashboard/investment'
    },
    {
      path: '/deposit',
      redirect: '/dashboard/deposit'
    },
    {
      path: '/transactions',
      redirect: '/dashboard/transactions'
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('../views/AdminDashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/moderator',
      name: 'ModeratorDashboard',
      component: () => import('../views/ModeratorDashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/legal/:docType',
      name: 'Legal',
      component: () => import('../views/LegalView.vue')
    },
    {
      path: '/privacy',
      redirect: '/legal/privacy'
    },
    {
      path: '/terms',
      redirect: '/legal/terms'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 65, // Adds a 130px buffer above the target element for header and ticker
        behavior: 'smooth',
      }
    }
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user_token');
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router
