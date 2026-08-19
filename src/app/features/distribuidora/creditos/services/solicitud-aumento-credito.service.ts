import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { SolicitudAumentoCredito } from '../../../../core/models/solicitud-aumento-credito.model';
import { PaginacionAnidada } from '../../../../core/models/paginacion-anidada.model';

@Injectable({ providedIn: 'root' })
export class SolicitudAumentoCreditoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidoras`;

  misSolicitudes(page = 1): Observable<ApiResponse<PaginacionAnidada<SolicitudAumentoCredito>>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ApiResponse<PaginacionAnidada<SolicitudAumentoCredito>>>(`${this.baseUrl}/aumento-credito`, { params });
  }

  solicitar(distribuidoraId: number, montoSolicitado: number, motivo: string): Observable<ApiResponse<SolicitudAumentoCredito>> {
    return this.http.post<ApiResponse<SolicitudAumentoCredito>>(`${this.baseUrl}/${distribuidoraId}/aumento-credito`, {
      monto_solicitado: montoSolicitado,
      motivo
    });
  }
}
