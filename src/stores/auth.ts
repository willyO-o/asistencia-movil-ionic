import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthService } from '../services/auth';
import { setUnauthorizedCallback } from '../services/api';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const loading = ref(true);

  // Getters
  const isAuthenticated = computed(() => !!user.value);

  // Actions
  async function checkAuthStatus() {
    try {
      console.log('🔄 Verificando estado de autenticación...');
      const isAuth = await AuthService.checkAuth();
      if (isAuth) {
        const userData = await AuthService.getCurrentUser();
        console.log('✅ Usuario autenticado:', userData);
        user.value = userData;
      } else {
        console.log('❌ Usuario no autenticado');
      }
    } catch (error) {
      console.error('❌ Error checking auth:', error);
    } finally {
      loading.value = false;
    }
  }

  async function login(loginUsername: string, password: string) {
    try {
      const result = await AuthService.login({
        login: loginUsername,
        password,
      });
      user.value = result.user;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await AuthService.logout();
      user.value = null;
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Configurar callback para errores 401
  function setupUnauthorizedCallback() {
    setUnauthorizedCallback(() => {
      console.log('🔴 Token expirado detectado. Cerrando sesión...');
      user.value = null;
    });
  }

  // Initialize
  async function initialize() {
    setupUnauthorizedCallback();
    await checkAuthStatus();
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    initialize,
  };
});
