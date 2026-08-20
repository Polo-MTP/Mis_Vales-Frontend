import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { LoginAttempt, PaginatedResponse } from '../../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/admin/historical-data`;

  listar(page = 1): Observable<ApiResponse<PaginatedResponse<LoginAttempt>>> {
    const params = new HttpParams()
      .set('page', String(page));

    return this.http.get<ApiResponse<PaginatedResponse<LoginAttempt>>>(
      this.baseUrl,
      { params }
    );
  }
}