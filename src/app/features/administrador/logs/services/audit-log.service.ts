import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { AuditLog } from '../../../../core/models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/logs`;

  listar(page = 1, action?: string): Observable<ApiResponse<PaginatedResponse<AuditLog>>> {
    let params = new HttpParams().set('page', String(page));
    if (action) {
      params = params.set('action', action);
    }
    return this.http.get<ApiResponse<PaginatedResponse<AuditLog>>>(this.baseUrl, { params });
  }
}
