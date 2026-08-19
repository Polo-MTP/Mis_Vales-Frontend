import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { EstadoRelacion, Relacion } from '../../../../core/models/relacion.model';
import { PaginacionAnidada } from '../../../../core/models/paginacion-anidada.model';

@Injectable({ providedIn: 'root' })
export class RelacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/relaciones`;

  listar(page = 1, estado?: EstadoRelacion): Observable<ApiResponse<PaginacionAnidada<Relacion>>> {
    let params = new HttpParams().set('page', String(page));
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<ApiResponse<PaginacionAnidada<Relacion>>>(this.baseUrl, { params });
  }

  detalle(id: number): Observable<ApiResponse<Relacion>> {
    return this.http.get<ApiResponse<Relacion>>(`${this.baseUrl}/${id}`);
  }
}
