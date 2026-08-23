import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // La sesión viaja en una cookie httpOnly (nunca leída por JS) en vez de un header
  // Authorization -- withCredentials hace que el navegador la mande sola en cada request.
  const authReq = req.clone({
    withCredentials: true,
    setHeaders: {
      Accept: 'application/json'
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
