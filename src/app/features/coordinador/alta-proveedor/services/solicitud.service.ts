import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { CrearSolicitudProveedorPayload, SolicitudProveedor } from '../../../../core/models/solicitud-proveedor.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private http = inject(HttpClient);

  crear(payload: CrearSolicitudProveedorPayload): Observable<ApiResponse<SolicitudProveedor>> {
    return this.http.post<ApiResponse<SolicitudProveedor>>(
      `${environment.apiUrl}/alta-proveedor/solicitudes`,
      payload
    );
  }
}
