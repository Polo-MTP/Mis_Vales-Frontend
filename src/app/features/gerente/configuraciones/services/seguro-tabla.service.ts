import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { SeguroTabla, SeguroTablaPayload } from '../../../../core/models/configuracion.model';

@Injectable({ providedIn: 'root' })
export class SeguroTablaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/configuraciones/seguros`;

  listar(incluirInactivos = false): Observable<ApiResponse<SeguroTabla[]>> {
    let params = new HttpParams();
    if (incluirInactivos) {
      params = params.set('activos', 'false');
    }
    return this.http.get<ApiResponse<SeguroTabla[]>>(this.baseUrl, { params });
  }

  crear(payload: SeguroTablaPayload): Observable<ApiResponse<SeguroTabla>> {
    return this.http.post<ApiResponse<SeguroTabla>>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: SeguroTablaPayload): Observable<ApiResponse<SeguroTabla>> {
    return this.http.put<ApiResponse<SeguroTabla>>(`${this.baseUrl}/${id}`, payload);
  }

  desactivar(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
