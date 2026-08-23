import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom, catchError, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { environment } from '../environments/environment';

// La sesión ahora se autentica por cookie httpOnly (ver auditoría de seguridad, hallazgo H-02),
// así que cada request que cambia estado (POST/PUT/DELETE) necesita el header X-XSRF-TOKEN que
// Sanctum verifica contra su propia cookie XSRF-TOKEN. Esa cookie solo existe después de pedirla
// una vez -- se hace aquí, al arrancar la app, antes de que cualquier pantalla intente hacer login.
//
// NO se usa withXsrfConfiguration(): esa protección de Angular solo adjunta el header en
// requests del MISMO origen que el SPA, y el API vive en un origen distinto (otro puerto en
// local, otro subdominio en producción) -- nunca se activaría. authInterceptor lee la cookie a
// mano y adjunta el header él mismo.
const sanctumOrigin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAppInitializer(() => {
      const http = inject(HttpClient);
      return firstValueFrom(
        http.get(`${sanctumOrigin}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
          catchError(() => of(null))
        )
      );
    })
  ]
};
