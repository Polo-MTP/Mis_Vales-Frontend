import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { Relacion } from '../../../../core/models/relacion.model';

@Injectable({ providedIn: 'root' })
export class RelacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/relaciones`;

  listar(page = 1, estado?: string, distribuidoraId?: number): Observable<ApiResponse<PaginatedResponse<Relacion>>> {
    let params = new HttpParams().set('page', String(page));
    if (estado) {
      params = params.set('estado', estado);
    }
    if (distribuidoraId) {
      params = params.set('distribuidora_id', String(distribuidoraId));
    }
    return this.http.get<ApiResponse<PaginatedResponse<Relacion>>>(this.baseUrl, { params });
  }

  detalle(id: number): Observable<ApiResponse<Relacion>> {
    return this.http.get<ApiResponse<Relacion>>(`${this.baseUrl}/${id}`);
  }

  /** Sin distribuidoraId, dispara el corte del día para todas las sucursales cuyo día de corte sea hoy. */
  generar(distribuidoraId?: number, fechaCorte?: string): Observable<ApiResponse<Relacion | Relacion[]>> {
    const body: Record<string, unknown> = {};
    if (distribuidoraId) body['distribuidora_id'] = distribuidoraId;
    if (fechaCorte) body['fecha_corte'] = fechaCorte;
    return this.http.post<ApiResponse<Relacion | Relacion[]>>(`${this.baseUrl}/generar`, body);
  }

  perdonar(id: number, motivo?: string): Observable<ApiResponse<Relacion>> {
    return this.http.post<ApiResponse<Relacion>>(`${this.baseUrl}/${id}/perdonar`, { motivo });
  }
}
