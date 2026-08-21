import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/models/auth-response.model';
import { PaginacionAnidada } from '../../core/models/paginacion-anidada.model';
import { Notificacion } from '../../core/models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/notificaciones`;

  /** El backend regresa el formato anidado (ResourceCollection::response()->getData(true)):
   *  data.data[] + data.meta.{current_page,total,...} -- no el plano de PaginatedResponse. */
  listar(
    page = 1,
    leidas?: boolean,
    perPage = 20
  ): Observable<ApiResponse<PaginacionAnidada<Notificacion>>> {

    let params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(perPage));

    if (leidas !== undefined) {
      params = params.set('leidas', String(leidas));
    }

    return this.http.get<
      ApiResponse<PaginacionAnidada<Notificacion>>
    >(this.baseUrl, { params });
  }

  marcarLeida(id: number): Observable<ApiResponse<Notificacion>> {
    return this.http.put<ApiResponse<Notificacion>>(`${this.baseUrl}/${id}/leida`, {});
  }
}