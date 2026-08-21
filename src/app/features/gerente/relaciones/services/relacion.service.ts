import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { Relacion } from '../../../../core/models/relacion.model';
import { PaginacionAnidada } from '../../../../core/models/paginacion-anidada.model';

@Injectable({ providedIn: 'root' })
export class RelacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/relaciones`;

  listar(page = 1, estado?: string, distribuidoraId?: number): Observable<ApiResponse<PaginacionAnidada<Relacion>>> {
    let params = new HttpParams().set('page', String(page));
    if (estado) {
      params = params.set('estado', estado);
    }
    if (distribuidoraId) {
      params = params.set('distribuidora_id', String(distribuidoraId));
    }
    return this.http.get<ApiResponse<PaginacionAnidada<Relacion>>>(this.baseUrl, { params });
  }

  detalle(id: number): Observable<ApiResponse<Relacion>> {
    return this.http.get<ApiResponse<Relacion>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Sin distribuidoraId, dispara el corte del día para todas las sucursales cuyo día de corte sea hoy.
   * `errores` trae, por distribuidora que falló, el motivo -- el resto de los cortes sí se generan.
   */
  generar(distribuidoraId?: number, fechaCorte?: string): Observable<ApiResponse<{ relaciones: Relacion[]; errores: string[] }>> {
    const body: Record<string, unknown> = {};
    if (distribuidoraId) body['distribuidora_id'] = distribuidoraId;
    if (fechaCorte) body['fecha_corte'] = fechaCorte;
    return this.http.post<ApiResponse<{ relaciones: Relacion[]; errores: string[] }>>(`${this.baseUrl}/generar`, body);
  }

  perdonar(id: number, motivo?: string): Observable<ApiResponse<Relacion>> {
    return this.http.post<ApiResponse<Relacion>>(`${this.baseUrl}/${id}/perdonar`, { motivo });
  }
}
