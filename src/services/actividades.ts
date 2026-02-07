import api from './api';
import type {
  ActividadesListResponse,
  ActividadesHoyResponse,
  ActividadDetalleResponse,
  CreateActividadRequest,
  UpdateActividadRequest,
  Actividad,
} from '../types';

export const ActividadesService = {
  // Listar actividades con filtros opcionales
  async getActividades(params?: {
    fecha?: string;
    activas?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<ActividadesListResponse> {
    try {
      console.log('📋 Obteniendo actividades con params:', params);
      const response = await api.get<ActividadesListResponse>('/actividades', { params });
      console.log('✅ Actividades obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo actividades:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener actividades');
    }
  },

  // Obtener actividades de hoy
  async getActividadesHoy(): Promise<ActividadesHoyResponse> {
    try {
      console.log('📅 Obteniendo actividades de hoy...');
      const response = await api.get<ActividadesHoyResponse>('/actividades/hoy');
      console.log('✅ Actividades de hoy:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo actividades de hoy:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener actividades de hoy');
    }
  },

  // Ver detalle de una actividad
  async getActividadDetalle(id: number): Promise<ActividadDetalleResponse> {
    try {
      console.log('🔍 Obteniendo detalle de actividad:', id);
      const response = await api.get<ActividadDetalleResponse>(`/actividades/${id}`);
      console.log('✅ Detalle de actividad:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo detalle de actividad:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener detalle de actividad');
    }
  },

  // Crear nueva actividad
  async createActividad(data: CreateActividadRequest): Promise<Actividad> {
    try {
      console.log('➕ Creando actividad:', data);
      const response = await api.post<Actividad>('/actividades', data);
      console.log('✅ Actividad creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando actividad:', error);
      throw new Error(error.response?.data?.message || 'Error al crear actividad');
    }
  },

  // Actualizar actividad existente
  async updateActividad(id: number, data: UpdateActividadRequest): Promise<Actividad> {
    try {
      console.log('✏️ Actualizando actividad:', id, data);
      const response = await api.put<Actividad>(`/actividades/${id}`, data);
      console.log('✅ Actividad actualizada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error actualizando actividad:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar actividad');
    }
  },

  // Eliminar actividad
  async deleteActividad(id: number): Promise<void> {
    try {
      console.log('🗑️ Eliminando actividad:', id);
      await api.delete(`/actividades/${id}`);
      console.log('✅ Actividad eliminada');
    } catch (error: any) {
      console.error('❌ Error eliminando actividad:', error);
      const message = error.response?.data?.message || 'Error al eliminar actividad';
      throw new Error(message);
    }
  },
};
