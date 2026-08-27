import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { User, LoginAttempt, PaginatedResponse } from '../../../core/models/user.model';
import { ApiResponse, LoginResultData, MfaSetupData } from '../../../core/models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(this.getStoredUser());

  // La sesión real vive en una cookie httpOnly que JS no puede leer (ver auditoría de
  // seguridad, hallazgo H-02) -- esta señal es solo una pista optimista para la UI (evita el
  // parpadeo del login mientras carga). La autorización real la valida el backend en cada
  // request vía la cookie; si ya no es válida, el interceptor limpia la sesión con el 401.
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role?.name || 'Sin Rol');

  /** Prefijo de ruta del layout de cada rol -- lo usan tanto redirectUserByRole() como
   *  cualquier link que necesite apuntar a una página dentro del layout del usuario actual
   *  (ej. "Cambiar contraseña" en app-user-menu, visible sin importar el rol). */
  readonly baseRoute = computed<string>(() => {
    switch (this.userRole()) {
      case 'Administrador': return '/administrador';
      case 'Gerente General':
      case 'Gerente de Sucursal': return '/gerente';
      case 'Coordinador': return '/coordinador';
      case 'Verificador': return '/verificador';
      case 'Distribuidora': return '/distribuidora';
      case 'Cajera': return '/cajera';
      default: return '/gerente';
    }
  });

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setSession(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  clearSession(): void {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  redirectUserByRole(): void {
    const role = this.userRole();
    switch (role) {
      case 'Administrador':
        this.router.navigate(['/administrador']);
        break;
      case 'Gerente General':
      case 'Gerente de Sucursal':
        this.router.navigate(['/gerente']);
        break;
      case 'Coordinador':
        this.router.navigate(['/coordinador']);
        break;
      case 'Verificador':
        this.router.navigate(['/verificador']);
        break;
      case 'Distribuidora':
        this.router.navigate(['/distribuidora']);
        break;
      case 'Cajera':
        this.router.navigate(['/cajera']);
        break;
      default:
        if (this.isAuthenticated()) {
          this.fetchCurrentUser().subscribe({
            next: () => {
              const updatedRole = this.userRole();
              if (updatedRole === 'Administrador') this.router.navigate(['/administrador']);
              else if (updatedRole === 'Gerente General' || updatedRole === 'Gerente de Sucursal') this.router.navigate(['/gerente']);
              else if (updatedRole === 'Coordinador') this.router.navigate(['/coordinador']);
              else if (updatedRole === 'Verificador') this.router.navigate(['/verificador']);
              else if (updatedRole === 'Distribuidora') this.router.navigate(['/distribuidora']);
              else if (updatedRole === 'Cajera') this.router.navigate(['/cajera']);
              else this.router.navigate(['/gerente']);
            },
            error: () => {
              this.clearSession();
              this.router.navigate(['/auth/login']);
            }
          });
        } else {
          this.router.navigate(['/auth/login']);
        }
        break;
    }
  }


  login(credentials: { email: string; password: string; recaptcha?: string }): Observable<ApiResponse<LoginResultData>> {
    return this.http.post<ApiResponse<LoginResultData>>(`${environment.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data?.user) {
          this.setSession(res.data.user);
        }
      })
    );
  }

  verifyMfa(mfa_method_id: string, code: string, recaptcha?: string): Observable<ApiResponse<LoginResultData>> {
    return this.http.post<ApiResponse<LoginResultData>>(`${environment.apiUrl}/mfa/verify`, { mfa_method_id, code, recaptcha }).pipe(
      tap(res => {
        if (res.success && res.data?.user) {
          this.setSession(res.data.user);
        }
      })
    );
  }

  verifyEmailOtp(otp_token: string, code: string, recaptcha?: string): Observable<ApiResponse<LoginResultData>> {
    return this.http.post<ApiResponse<LoginResultData>>(`${environment.apiUrl}/mfa/email/verify`, { otp_token, code, recaptcha }).pipe(
      tap(res => {
        if (res.success && res.data?.user) {
          this.setSession(res.data.user);
        }
      })
    );
  }

  getMfaSetup(setupUrl: string): Observable<ApiResponse<MfaSetupData>> {
    // El link viene firmado por el backend (email + expires + signature). Se reenvía tal cual
    // la query string recibida — reconstruirla con HttpParams podría re-codificar caracteres
    // distinto a como se firmó y así invalidar la firma.
    const query = new URL(setupUrl).search;
    return this.http.get<ApiResponse<MfaSetupData>>(`${environment.apiUrl}/mfa/setup${query}`);
  }

  confirmMfaSetup(mfa_method_id: string, code: string, recaptcha?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/mfa/setup/confirm`, { mfa_method_id, code, recaptcha });
  }

  forgotPassword(email: string, recaptcha?: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${environment.apiUrl}/forgot-password`, { email, recaptcha });
  }

  resetPassword(
    token: string,
    email: string,
    password: string,
    password_confirmation: string,
    recaptcha?: string
  ): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${environment.apiUrl}/reset-password`, {
      token,
      email,
      password,
      password_confirmation,
      recaptcha
    });
  }

  changePassword(current_password: string, password: string, password_confirmation: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${environment.apiUrl}/me/password`, {
      current_password,
      password,
      password_confirmation
    });
  }

  logout(): void {
    // La sesión vive en la cookie, no en algo que este servicio pueda inspeccionar -- siempre
    // se intenta cerrar en el backend; si ya no había sesión válida, el backend simplemente
    // no tiene nada que hacer y de todos modos se limpia el estado local.
    this.http.post(`${environment.apiUrl}/logout`, {}).subscribe({
      complete: () => this.finalizeLogout(),
      error: () => this.finalizeLogout()
    });
  }

  private finalizeLogout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  fetchCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      })
    );
  }

  getAuditLogs(page: number = 1): Observable<ApiResponse<PaginatedResponse<LoginAttempt>>> {
    return this.http.get<ApiResponse<PaginatedResponse<LoginAttempt>>>(`${environment.apiUrl}/admin/historical-data?page=${page}`);
  }
}
