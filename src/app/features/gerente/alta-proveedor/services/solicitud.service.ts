import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { AprobarSolicitudPayload, SolicitudProveedor } from '../../../../core/models/solicitud-proveedor.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/alta-proveedor/solicitudes`;

  listar(estado?: string): Observable<ApiResponse<PaginatedResponse<SolicitudProveedor>>> {
    let params = new HttpParams().set('include', 'datosPersonales.direccion,sucursal,coordinador,verificador');

    if (estado) {
      params = params.set('filter[estado]', estado);
    }

    return this.http.get<ApiResponse<PaginatedResponse<SolicitudProveedor>>>(this.baseUrl, { params });
  }

  detalle(id: number): Observable<ApiResponse<SolicitudProveedor>> {
    // El backend siempre carga datosPersonales.direccion, sucursal, coordinador,
    // verificador, gerente, evidencias y logs en show() — no usa QueryBuilder aquí.
    return this.http.get<ApiResponse<SolicitudProveedor>>(`${this.baseUrl}/${id}`);
  }

  aprobarORechazar(id: number, payload: AprobarSolicitudPayload): Observable<ApiResponse<SolicitudProveedor>> {
    return this.http.post<ApiResponse<SolicitudProveedor>>(`${this.baseUrl}/${id}/aprobar`, payload);
  }
}
