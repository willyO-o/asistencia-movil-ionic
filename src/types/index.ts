export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: ApiUser;
}

export interface ApiUser {
  id: number;
  usuario: string;
  email: string;
  id_persona_fk: number;
  id_rol_fk: number;
  estado_usuario: string;
  us_avatar: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  login: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AttendanceRequest {
  qrCode: string;
  userId: string;
  timestamp: string;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Tipos para Actividades
export interface Actividad {
  id: number;
  nombre_actividad: string;
  fecha_actividad: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

export interface ActividadDetalle extends Actividad {
  asistencias: Asistencia[];
}

export interface Asistencia {
  id: number;
  id_persona_fk: number;
  id_actividad_fk: number;
  hora_asistencia: string;
  tipo_asistencia: 'PRESENTE' | 'PERMISO' | 'FALTA';
  observacion?: string;
  created_at: string;
  updated_at: string;
}

export interface ActividadesListResponse {
  data: Actividad[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}

export interface ActividadesHoyResponse {
  fecha: string;
  actividades: Actividad[];
  total: number;
}

export interface ActividadDetalleResponse {
  actividad: ActividadDetalle;
  total_asistencias: number;
  con_permiso: number;
}

export interface CreateActividadRequest {
  nombre_actividad: string;
  fecha_actividad: string;
  descripcion?: string;
}

export interface UpdateActividadRequest extends CreateActividadRequest {}

// Tipos para Asistencias
export interface AsistenciaPersona {
  id_asistencia: number;
  id_actividad_fk: number;
  id_persona_fk: number;
  observacion: string | null;
  ingreso: string | null;
  salida: string | null;
  fecha_asistencia: string;
  estado_asistencia: 'PRESENTE' | 'PERMISO' | 'FALTA';
  permiso: number;
  nombre: string;
  paterno: string;
  materno: string;
  numero_documento: string;
  foto: string | null;
  nombre_grupo: string;
  nombre_sucursal: string;
  id_grupo_entrenamiento: number;
}

export interface EstadisticasAsistencia {
  total: number;
  con_salida: number;
  sin_salida: number;
  con_permiso: number;
}

export interface AsistenciasActividadResponse {
  actividad: Actividad;
  asistencias: AsistenciaPersona[];
  estadisticas: EstadisticasAsistencia;
}

export interface AsistenciasFilterParams {
  page?: number;
  size?: number;
  search?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}
