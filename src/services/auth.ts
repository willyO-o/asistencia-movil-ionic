import api from './api';
import { StorageService } from './storage';
import type { LoginRequest, LoginResponse, User } from '../types';

export const AuthService = {
  // Login
  async login(credentials: LoginRequest): Promise<{ token: string; user: User }> {
    try {
      console.log('🔐 Intentando login con:', { login: credentials.login });

      const response = await api.post<LoginResponse>('/auth/login', credentials);
      const { access_token, user: apiUser } = response.data;

      // Mapear el usuario de la API al formato interno
      const user: User = {
        id: apiUser.id.toString(),
        login: apiUser.usuario,
        name: apiUser.usuario,
        email: apiUser.email,
        avatar: apiUser.us_avatar,
      };

      console.log('✅ Login exitoso:', { userId: user.id, userName: user.name });

      // Guardar token y usuario
      await StorageService.saveToken(access_token);
      await StorageService.saveUser(user);

      // Configurar el token en los headers de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return { token: access_token, user };
    } catch (error: any) {
      console.error('❌ Error en login:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        data: error.response?.data,
        error: error.message,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Error en el login';
      throw new Error(errorMessage);
    }
  },

  // Logout - NO eliminar el token, solo limpiar el estado de usuario
  async logout(): Promise<void> {
    // No eliminar el token ni el usuario del storage
    // Solo limpiar el estado en memoria
    console.log('📤 Logout - No se elimina el token, se mantiene para futuras sesiones');
  },

  // Verificar autenticación
  async checkAuth(): Promise<boolean> {
    console.log('🔍 Verificando autenticación...');
    const isValid = await StorageService.isTokenValid();
    console.log('Token válido:', isValid);

    if (isValid) {
      const token = await StorageService.getToken();
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Token configurado en headers');
        return true;
      }
    }
    console.log('❌ No hay token válido');
    return false;
  },

  // Obtener usuario actual
  async getCurrentUser() {
    return await StorageService.getUser();
  },
};
