import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/actividades',
    name: 'Actividades',
    component: () => import('../views/ActividadesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/asistencias',
    name: 'Asistencias',
    component: () => import('../views/AsistenciasView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/qr-scanner',
    name: 'QRScanner',
    component: () => import('../views/QRScannerView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Guard de navegación
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false;

  // Esperar a que termine la inicialización si aún está cargando
  if (authStore.loading) {
    await new Promise<void>((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch();
          resolve();
        }
      });
      // Timeout de seguridad
      setTimeout(() => resolve(), 2000);
    });
  }

  console.log('🔀 Navegación:', {
    to: to.path,
    requiresAuth,
    isAuthenticated: authStore.isAuthenticated,
  });

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/home');
  } else {
    next();
  }
});

export default router;
