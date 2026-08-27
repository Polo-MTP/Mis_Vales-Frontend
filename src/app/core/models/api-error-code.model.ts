/**
 * Espejo de App\Enums\ApiErrorCode (backend) -- un identificador estable en inglés que viaja
 * en 'error_code' dentro de CUALQUIER respuesta {success: false, ...} de la API. Úsalo para
 * distinguir el TIPO de error sin parsear 'message' (texto en español, puede cambiar de
 * redacción sin previo aviso). No es un código por regla de negocio (ej. "límite de crédito
 * excedido") -- es el nivel de "mecanismo de falla" del framework/capa de seguridad; el
 * detalle fino de negocio sigue viviendo en 'message'.
 */
export type ApiErrorCode =
  // Autenticación / sesión
  | 'UNAUTHENTICATED'
  | 'ACCOUNT_INACTIVE'
  // Autorización
  | 'FORBIDDEN'
  | 'VPN_REQUIRED'
  // Solicitud / validación
  | 'VALIDATION_ERROR'
  | 'DOMAIN_ERROR'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'RATE_LIMITED'
  // Servidor
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

/** Cuerpo típico de una respuesta de error de la API (ver ApiResponse<T> para el de éxito). */
export interface ApiErrorBody {
  success: false;
  message: string;
  error_code?: ApiErrorCode;
  errors?: Record<string, string[]>;
}

/**
 * Lee error_code de un HttpErrorResponse de Angular de forma segura -- err.error puede no
 * traer nada parseable (ver auth.interceptor.ts: normalizarErrorDeRed ya cubre el caso de
 * status 0 con un mensaje claro, pero sigue sin error_code real).
 */
export function leerErrorCode(err: unknown): ApiErrorCode | null {
  const body = (err as { error?: Partial<ApiErrorBody> } | null)?.error;
  return body?.error_code ?? null;
}

/**
 * Código corto para mostrar al usuario junto al mensaje (ej. "Código: MV-301"), para que lo
 * anote y lo reporte a soporte sin describir el problema ni mandar una captura. Vive solo
 * aquí, en el frontend -- el backend nunca lo calcula ni lo manda, solo el 'error_code'
 * técnico de arriba. Agrupado por prefijo para que soporte triage por familia con solo ver
 * el número: 1xx sesión, 2xx permisos, 3xx solicitud/negocio, 5xx servidor.
 */
const CODIGOS_DE_SOPORTE: Record<ApiErrorCode, string> = {
  UNAUTHENTICATED: 'MV-101',
  ACCOUNT_INACTIVE: 'MV-103',
  FORBIDDEN: 'MV-201',
  VPN_REQUIRED: 'MV-202',
  VALIDATION_ERROR: 'MV-301',
  DOMAIN_ERROR: 'MV-302',
  NOT_FOUND: 'MV-303',
  METHOD_NOT_ALLOWED: 'MV-304',
  RATE_LIMITED: 'MV-305',
  SERVER_ERROR: 'MV-501',
  SERVICE_UNAVAILABLE: 'MV-502'
};

/** Traduce un error_code técnico al código corto reportable, o null si no hay uno (respuesta
 *  de red sin error_code real, o un error_code futuro que aún no se agregó a la tabla). */
export function obtenerCodigoDeSoporte(errorCode: ApiErrorCode | null | undefined): string | null {
  return errorCode ? (CODIGOS_DE_SOPORTE[errorCode] ?? null) : null;
}
