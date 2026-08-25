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
  | 'SESSION_IDLE_TIMEOUT'
  | 'ACCOUNT_INACTIVE'
  | 'EMAIL_NOT_VERIFIED'
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
