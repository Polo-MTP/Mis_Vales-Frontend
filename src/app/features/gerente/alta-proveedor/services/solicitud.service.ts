import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { AprobarSolicitudPayload, SolicitudProveedor } from '../../../../core/models/solicitud-proveedor.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/alta-proveedor/solicitudes`;

  listar(estado?: string, page = 1): Observable<ApiResponse<SolicitudProveedor[]>> {
    let params = new HttpParams()
      .set('include', 'datosPersonales.direccion,sucursal,coordinador,verificador')
      .set('page', String(page));

    if (estado) {
      params = params.set('filter[estado]', estado);
    }

    // El helper `success()` del backend envuelve la ResourceCollection dentro de
    // {data: ...}, lo cual hace que Laravel serialice `data` como un array plano
    // (no como {data, current_page, ...}) aunque la query esté paginada. Por eso
    // no hay total/last_page: el frontend pagina "a ciegas" con ?page= y detecta
    // si hay más páginas comparando el tamaño de la respuesta contra PER_PAGE.
    return this.http.get<ApiResponse<SolicitudProveedor[]>>(this.baseUrl, { params });
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
