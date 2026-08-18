import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import { Evidencia } from '../models/solicitud-proveedor.model';

@Injectable({ providedIn: 'root' })
export class EvidenciaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/alta-proveedor/solicitudes`;

  /** Sube el archivo real de una evidencia (jpg/jpeg/png/pdf, máx. 5MB) ya con la solicitud creada. */
  subir(solicitudId: number, archivo: File, tipoDocumento: string): Observable<ApiResponse<Evidencia>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('tipo_documento', tipoDocumento);

    return this.http.post<ApiResponse<Evidencia>>(`${this.baseUrl}/${solicitudId}/evidencias`, formData);
  }
}
