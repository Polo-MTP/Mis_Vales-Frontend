import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { CrearSolicitudProveedorPayload, SolicitudProveedor } from '../../../../core/models/solicitud-proveedor.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/alta-proveedor/solicitudes`;

  crear(payload: CrearSolicitudProveedorPayload): Observable<ApiResponse<SolicitudProveedor>> {
    return this.http.post<ApiResponse<SolicitudProveedor>>(this.baseUrl, payload);
  }

  /**
   * Cuenta (primera página, máx. 15) las solicitudes que este coordinador capturó
   * en un estado específico. Se usa para las tarjetas de resumen del dashboard.
   */
  contarPorEstado(estado: string, coordinadorId: number): Observable<ApiResponse<SolicitudProveedor[]>> {
    const params = new HttpParams()
      .set('filter[estado]', estado)
      .set('filter[coordinador_id]', String(coordinadorId));

    return this.http.get<ApiResponse<SolicitudProveedor[]>>(this.baseUrl, { params });
  }

  /** Lista SOLO las solicitudes que este coordinador registró, opcionalmente filtradas por estado. */
  listar(coordinadorId: number, estado?: string, page = 1): Observable<ApiResponse<SolicitudProveedor[]>> {
    let params = new HttpParams()
      .set('include', 'datosPersonales.direccion,sucursal,coordinador,verificador,categoria')
      .set('filter[coordinador_id]', String(coordinadorId))
      .set('page', String(page));

    if (estado) {
      params = params.set('filter[estado]', estado);
    }

    return this.http.get<ApiResponse<SolicitudProveedor[]>>(this.baseUrl, { params });
  }

  detalle(id: number): Observable<ApiResponse<SolicitudProveedor>> {
    return this.http.get<ApiResponse<SolicitudProveedor>>(`${this.baseUrl}/${id}`);
  }
}
