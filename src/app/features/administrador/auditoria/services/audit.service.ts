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

  listar(page = 1): Observable<ApiResponse<PaginatedResponse<LoginAttempt>>> {
    const params = new HttpParams()
      .set('page', String(page));

    return this.http.get<ApiResponse<PaginatedResponse<LoginAttempt>>>(
      `${this.baseUrl}/historical-data`,
      { params }
    );
  }

  /** Bitácora general de creación/edición/borrado de los modelos de negocio, no solo accesos. */
  listarBitacora(page = 1, userId?: number, action?: string): Observable<ApiResponse<PaginatedResponse<AuditLog>>> {
    let params = new HttpParams().set('page', String(page));
    if (userId) {
      params = params.set('user_id', String(userId));
    }
    if (action) {
      params = params.set('action', action);
    }

    return this.http.get<ApiResponse<PaginatedResponse<AuditLog>>>(
      `${this.baseUrl}/logs`,
      { params }
    );
  }
}