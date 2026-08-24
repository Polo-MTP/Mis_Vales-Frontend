export interface Direccion {
  id: number | null;
  calle: string | null;
  colonia: string | null;
  numero_ext: string | null;
  numero_int: string | null;
  codigo_postal: string | null;
  estado: string | null;
  ciudad: string | null;
  /** Geocodificadas automáticamente en el backend; null si aún no se procesó o Google no encontró la dirección. */
  latitud: number | null;
  longitud: number | null;
}

export interface DatosPersonales {
  id: number | null;
  nombre: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  curp: string | null;
  fecha_nacimiento: string | null;
  lugar_nacimiento: string | null;
  direccion: Direccion;
}

export interface UsuarioResumen {
  id: number | null;
  name: string | null;
  email: string | null;
}

export interface Sucursal {
  id: number | null;
  nombre: string | null;
  codigo: string | null;
  es_matriz: boolean | null;
}

export interface Evidencia {
  id?: number;
  tipo_documento: string;
  url_archivo: string;
  subido_por?: string | null;
  fecha_subida?: string | null;
}

export interface LogAuditoria {
  id: number;
  entidad_tipo: string;
  entidad_id: number;
  campo: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  modificado_por: string | null;
  accion: string;
  motivo?: string | null;
  fecha_hora: string;
  dispositivo?: string | null;
}

export type EstadoSolicitud =
  | 'pendiente_verificacion'
  | 'en_verificacion'
  | 'verificado'
  | 'rechazado'
  | 'aprobado';

export interface SolicitudProveedor {
  id: number;
  estado: EstadoSolicitud;
  nombre: string | null;
  rfc: string | null;
  datos_familiares: Record<string, unknown> | null;
  datos_vehiculos: Record<string, unknown> | null;
  datos_vivienda: Record<string, unknown> | null;
  referencia_laboral: string | null;
  cumple: boolean | null;
  comentario_verificador: string | null;
  fecha_verificacion: string | null;
  decision_gerente: string | null;
  comentario_gerente: string | null;
  limite_credito_asignado: string | null;
  fecha_decision: string | null;
  sucursal: Sucursal;
  datos_personales: DatosPersonales;
  coordinador: UsuarioResumen;
  verificador: UsuarioResumen;
  gerente: UsuarioResumen;
  evidencias: Evidencia[];
  logs_auditoria: LogAuditoria[];
  created_at: string;
  updated_at: string;
}

export interface CrearSolicitudProveedorPayload {
  /** Nombre del negocio -- distinto de `nombre` (persona), que va abajo; el backend valida
   *  este payload plano y necesita las dos claves separadas para no pisarse. */
  nombre_negocio: string;
  rfc: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  curp: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  calle: string;
  colonia: string;
  numero_ext: string;
  numero_int?: string;
  codigo_postal: string;
  estado: string;
  ciudad: string;
  referencia_laboral?: string;
  datos_familiares?: Record<string, unknown>;
  datos_vehiculos?: Record<string, unknown>;
  datos_vivienda?: Record<string, unknown>;
  verificador_id?: number;
  evidencias?: Evidencia[];
}

export interface EditarDatosPersonalesPayload {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  curp?: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
}

export interface EditarDireccionPayload {
  calle?: string;
  colonia?: string;
  numero_ext?: string;
  numero_int?: string;
  codigo_postal?: string;
  estado?: string;
  ciudad?: string;
}

export interface VerificarSolicitudPayload {
  cumple: boolean;
  comentario_verificador: string;
  dispositivo?: string;
  motivo_edicion?: string;
  datos_personales?: EditarDatosPersonalesPayload;
  direccion?: EditarDireccionPayload;
  evidencias?: Evidencia[];
}

export interface AprobarSolicitudPayload {
  decision: 'aprobado' | 'rechazado';
  comentario_gerente?: string;
  limite_credito_asignado?: number;
  email?: string;
  password?: string;
  dispositivo?: string;
}