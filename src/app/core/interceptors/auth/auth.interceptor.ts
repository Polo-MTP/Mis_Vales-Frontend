import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/** Angular solo adjunta el header X-XSRF-TOKEN automáticamente en requests del MISMO origen
 *  (es una protección propia del framework contra filtrar el token a otros dominios) -- como el
 *  API vive en un origen distinto al del SPA (otro puerto en local, otro subdominio en
 *  producción), withXsrfConfiguration() nunca lo manda solo. Hay que leer la cookie a mano. */
function leerCookieXsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Status 0 = la petición nunca llegó a tener una respuesta HTTP real (sin conexión, CORS,
 * servidor caído, timeout de red) -- ahí Angular mete el error crudo del navegador dentro de
 * `error.error` (un TypeError con mensaje "Failed to fetch", un ProgressEvent, etc.), no un
 * cuerpo JSON del backend. Sin normalizar esto, cualquier pantalla que hace
 * `err.error?.message || 'mensaje pensado para el usuario'` termina mostrando ese texto crudo
 * en inglés -- pasa el `||` porque sí es un valor truthy, solo que no es un mensaje real.
 */
function normalizarErrorDeRed(error: HttpErrorResponse): HttpErrorResponse {
  if (error.status !== 0) {
    return error;
  }

  return new HttpErrorResponse({
    error: { message: 'No se pudo conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.' },
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined
  });
}

/**
 * El backend agrega 'support_code' (ej. "MV-301") a CUALQUIER respuesta de error -- un código
 * corto y reportable, distinto de 'error_code' (ese es técnico, para lógica de cliente; este
 * es para que la persona lo lea y lo reporte a soporte). Se pega aquí, en un solo lugar, en
 * vez de tocar cada una de las ~50 pantallas que hacen `err.error?.message` -- así todas lo
 * muestran junto al mensaje sin cambiar nada más.
 */
function agregarCodigoDeSoporte(error: HttpErrorResponse): HttpErrorResponse {
  const cuerpo = error.error;
  const codigo = cuerpo?.support_code;
  const mensaje = cuerpo?.message;

  if (!codigo || typeof mensaje !== 'string' || mensaje.includes(codigo)) {
    return error;
  }

  return new HttpErrorResponse({
    error: { ...cuerpo, message: `${mensaje} (Código: ${codigo})` },
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined
  });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const xsrfToken = leerCookieXsrf();

  // La sesión viaja en una cookie httpOnly (nunca leída por JS) en vez de un header
  // Authorization -- withCredentials hace que el navegador la mande sola en cada request.
  const authReq = req.clone({
    withCredentials: true,
    setHeaders: {
      Accept: 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorNormalizado = agregarCodigoDeSoporte(normalizarErrorDeRed(error));

      const isAuthChallengeRequest = req.url.includes('/login') || req.url.includes('/mfa/');
      if (errorNormalizado.status === 401 && !isAuthChallengeRequest) {
        const yaHabiaSesion = authService.isAuthenticated();
        authService.clearSession();
        router.navigate(['/auth/login'], {
          queryParams: yaHabiaSesion ? { sessionMessage: errorNormalizado.error?.message || 'Tu sesión terminó. Inicia sesión de nuevo.' } : {}
        });
      }
      return throwError(() => errorNormalizado);
    })
  );
};
