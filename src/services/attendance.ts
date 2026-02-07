import api from './api';
import type { AttendanceResponse } from '../types';

const API_BASE_URL_REPLACE = 'https://davidvargas.com.bo/detalle-inscripcion/';

export const AttendanceService = {
  // Marcar asistencia para una actividad específica
  async markAttendanceForActivity(
    codigoMD5: string,
    actividadId: number,
    observacion?: string
  ): Promise<AttendanceResponse> {
    try {
      console.log(
        '📝 Marcando asistencia para actividad:',
        actividadId,
        'con código MD5:',
        codigoMD5
      );

      const response = await api.post<any>('/asistencia/qr', {
        codigo: codigoMD5,
        id_actividad_fk: actividadId,
        observacion: observacion || 'Registro mediante app móvil',
      });

      console.log('✅ Asistencia marcada:', response.data);

      // Adaptar respuesta al formato esperado
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('❌ Error marcando asistencia:', error);

      // Manejar diferentes tipos de errores
      const errorData = error.response?.data;
      if (errorData?.tipo) {
        switch (errorData.tipo) {
          case 'actividad_no_encontrada':
            throw new Error('La actividad no existe o no está disponible');
          case 'persona_no_encontrada':
            throw new Error('Código QR inválido o persona no registrada');
          case 'asistencia_duplicada':
            throw new Error(
              `Ya se registró la asistencia a esta actividad a las ${
                errorData.data?.hora_entrada || 'N/A'
              }`
            );
          default:
            throw new Error(errorData.message || 'Error al marcar asistencia');
        }
      }

      throw new Error(error.response?.data?.message || 'Error al marcar asistencia');
    }
  },

  // Extraer código MD5 del QR
  extractMD5FromQR(qrData: string): string {
    let codigoMD5 = qrData;

    console.log('📷 QR escaneado:', qrData);
    console.log('🔍 Buscando URL base:', API_BASE_URL_REPLACE);

    // Verificar si el QR contiene la URL base
    if (API_BASE_URL_REPLACE && qrData.includes(API_BASE_URL_REPLACE)) {
      // Quitar la URL base para obtener el hash MD5
      codigoMD5 = qrData.replace(API_BASE_URL_REPLACE, '');
      console.log('✅ URL encontrada y removida. MD5 extraído:', codigoMD5);
    } else {
      console.log('⚠️ URL base no encontrada en el QR, usando texto completo como MD5');
    }

    return codigoMD5;
  },
};
