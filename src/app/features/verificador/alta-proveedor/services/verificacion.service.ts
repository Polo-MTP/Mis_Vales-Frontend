import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { 
  SolicitudProveedor, 
  VerificarSolicitudPayload 
} from '../../../../core/models/solicitud-proveedor.model';

@Injectable({ providedIn: 'root' })
export class VerificacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/alta-proveedor/solicitudes`;

  /**
   * Obtiene la lista de solicitudes asignadas o pendientes de verificación.
   * Filtra por defecto las que están en 'en_verificacion' o 'pendiente_verificacion'.
   */
obtenerSolicitudesPendientes(estado?: string, page = 1): Observable<ApiResponse<SolicitudProveedor[]>> {
  let params = new HttpParams()
    .set('include', 'datosPersonales.direccion,sucursal,coordinador,verificador')
    .set('page', String(page));

  if (estado) {
    params = params.set('filter[estado]', estado);
  }

  return this.http.get<ApiResponse<SolicitudProveedor[]>>(this.baseUrl, { params });
}
  /**
   * Obtiene el detalle de una solicitud específica para cargar en el formulario de la Tablet.
   */
  obtenerDetalle(id: number): Observable<ApiResponse<SolicitudProveedor>> {
    return this.http.get<ApiResponse<SolicitudProveedor>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Envía el dictamen del Verificador, fotos tomadas y datos corregidos (si aplicó cambios).
   */
  guardarDictamen(id: number, payload: VerificarSolicitudPayload): Observable<ApiResponse<SolicitudProveedor>> {
    return this.http.post<ApiResponse<SolicitudProveedor>>(`${this.baseUrl}/${id}/verificar`, payload);
  }
}