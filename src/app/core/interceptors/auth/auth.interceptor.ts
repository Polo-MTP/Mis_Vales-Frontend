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
      const isAuthChallengeRequest = req.url.includes('/login') || req.url.includes('/mfa/');
      if (error.status === 401 && !isAuthChallengeRequest) {
        const yaHabiaSesion = authService.isAuthenticated();
        authService.clearSession();
        router.navigate(['/auth/login'], {
          queryParams: yaHabiaSesion ? { sessionMessage: error.error?.message || 'Tu sesión terminó. Inicia sesión de nuevo.' } : {}
        });
      }
      return throwError(() => error);
    })
  );
};
