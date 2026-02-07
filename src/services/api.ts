import axios from 'axios';
import { StorageService } from './storage';

const API_BASE_URL = 'https://davidvargas.com.bo/api';

console.log('🌐 API_BASE_URL configurada:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback para notificar cuando ocurra un 401
let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    console.log('📤 Request:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.warn('⚠️ Token expirado o inválido - 401 Unauthorized. Cerrando sesión...');
      await StorageService.clearAll();
      delete api.defaults.headers.common['Authorization'];

      // Notificar a la app para que actualice el estado
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
