import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { DistribuidoraMorosa } from '../../../../core/models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reportes`;

  morosos(): Observable<ApiResponse<DistribuidoraMorosa[]>> {
    return this.http.get<ApiResponse<DistribuidoraMorosa[]>>(`${this.baseUrl}/morosos`);
  }

  /**
   * Descarga el Excel de pagos por quincena de una distribuidora, hasta el corte elegido (o el
   * más reciente si no se manda). Blob, no pasa por el interceptor de JSON de la API.
   */
  pagosQuincena(distribuidoraId: number, hastaRelacionId?: number): Observable<Blob> {
    let params = new HttpParams().set('distribuidora_id', String(distribuidoraId));
    if (hastaRelacionId) {
      params = params.set('hasta_relacion_id', String(hastaRelacionId));
    }
    return this.http.get(`${this.baseUrl}/pagos-quincena`, { params, responseType: 'blob' });
  }
}
