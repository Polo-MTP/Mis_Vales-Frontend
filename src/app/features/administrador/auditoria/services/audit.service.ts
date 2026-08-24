import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { LoginAttempt, PaginatedResponse } from '../../../../core/models/user.model';
import { AuditLog } from '../../../../core/models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/admin`;

  listar(page = 1, filters?: { user_id?: number; status?: string; search?: string }): Observable<ApiResponse<PaginatedResponse<LoginAttempt>>> {
    let params = new HttpParams().set('page', String(page));

    if (filters?.user_id) {
      params = params.set('user_id', String(filters.user_id));
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<ApiResponse<PaginatedResponse<LoginAttempt>>>(
      `${this.baseUrl}/historical-data`,
      { params }
    );
  }

  /** Bitácora general de creación/edición/borrado de todos los modelos y eventos del sistema. */
  listarBitacora(
    page = 1,
    filters?: {
      user_id?: number;
      sucursal_id?: number;
      modulo?: string;
      nivel?: string;
      action?: string;
      search?: string;
    }
  ): Observable<ApiResponse<PaginatedResponse<AuditLog>>> {
    let params = new HttpParams().set('page', String(page));

    if (filters?.user_id) {
      params = params.set('user_id', String(filters.user_id));
    }
    if (filters?.sucursal_id) {
      params = params.set('sucursal_id', String(filters.sucursal_id));
    }
    if (filters?.modulo) {
      params = params.set('modulo', filters.modulo);
    }
    if (filters?.nivel) {
      params = params.set('nivel', filters.nivel);
    }
    if (filters?.action) {
      params = params.set('action', filters.action);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<ApiResponse<PaginatedResponse<AuditLog>>>(
      `${this.baseUrl}/logs`,
      { params }
    );
  }
}