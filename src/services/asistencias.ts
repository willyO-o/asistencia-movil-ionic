import api from './api';
import type { AsistenciasActividadResponse, AsistenciasFilterParams } from '../types';

export const AsistenciasService = {
  // Obtener asistencias de una actividad
  async getAsistenciasPorActividad(
    idActividad: number,
    params?: AsistenciasFilterParams
  ): Promise<AsistenciasActividadResponse> {
    try {
      console.log('📋 Obteniendo asistencias de actividad:', idActividad, params);
      const response = await api.get<AsistenciasActividadResponse>(
        `/asistencia/actividad/${idActividad}`,
        { params }
      );
      console.log('✅ Asistencias obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo asistencias:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener asistencias');
    }
  },

  // Eliminar asistencia
  async deleteAsistencia(idAsistencia: number): Promise<void> {
    try {
      console.log('🗑️ Eliminando asistencia:', idAsistencia);
      const response = await api.delete(`/asistencia/${idAsistencia}`);
      console.log('✅ Asistencia eliminada:', response.data);
    } catch (error: any) {
      console.error('❌ Error eliminando asistencia:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar asistencia');
    }
  },
};
