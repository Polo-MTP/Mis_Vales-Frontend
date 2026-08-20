import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/models/auth-response.model';
import { PaginatedResponse } from '../../core/models/user.model';
import { Notificacion } from '../../core/models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/notificaciones`;

  listar(
    page = 1
  ): Observable<ApiResponse<PaginatedResponse<Notificacion>>> {

    const params = new HttpParams()
      .set('page', String(page));

    return this.http.get<
      ApiResponse<PaginatedResponse<Notificacion>>
    >(this.baseUrl, { params });
  }
}