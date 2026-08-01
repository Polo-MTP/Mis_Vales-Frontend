import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginAttempt, PaginatedResponse } from '../models/user.model';
import { ApiResponse, LoginResultData, MfaSetupData } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly token = signal<string | null>(localStorage.getItem('token'));
  
  readonly isAuthenticated = computed(() => !!this.token());
  readonly userRole = computed(() => this.currentUser()?.role?.name || 'Invitado');

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setSession(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string; recaptcha?: string }): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${environment.apiUrl}/register`, data).pipe(
      tap(res => {
        if (res.success && res.data?.token && res.data?.user) {
          this.setSession(res.data.user, res.data.token);
        }
      })
    );
  }

  login(credentials: { email: string; password: string; recaptcha?: string }): Observable<ApiResponse<LoginResultData>> {
    return this.http.post<ApiResponse<LoginResultData>>(`${environment.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data?.token && res.data?.user) {
          this.setSession(res.data.user, res.data.token);
        }
      })
    );
  }

  verifyMfa(mfa_method_id: string, code: string): Observable<ApiResponse<LoginResultData>> {
    return this.http.post<ApiResponse<LoginResultData>>(`${environment.apiUrl}/mfa/verify`, { mfa_method_id, code }).pipe(
      tap(res => {
        if (res.success && res.data?.token && res.data?.user) {
          this.setSession(res.data.user, res.data.token);
        }
      })
    );
  }

  verifyEmailOtp(user_id: number, code: string): Observable<ApiResponse<LoginResultData>> {
    return this.http.post<ApiResponse<LoginResultData>>(`${environment.apiUrl}/mfa/email/verify`, { user_id, code }).pipe(
      tap(res => {
        if (res.success && res.data?.token && res.data?.user) {
          this.setSession(res.data.user, res.data.token);
        }
      })
    );
  }

  getMfaSetup(email: string): Observable<ApiResponse<MfaSetupData>> {
    return this.http.get<ApiResponse<MfaSetupData>>(`${environment.apiUrl}/mfa/setup`, { params: { email } });
  }

  confirmMfaSetup(mfa_method_id: string, code: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/mfa/setup/confirm`, { mfa_method_id, code });
  }

  logout(): void {
    if (this.token()) {
      this.http.post(`${environment.apiUrl}/logout`, {}).subscribe({
        complete: () => this.finalizeLogout(),
        error: () => this.finalizeLogout()
      });
    } else {
      this.finalizeLogout();
    }
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
