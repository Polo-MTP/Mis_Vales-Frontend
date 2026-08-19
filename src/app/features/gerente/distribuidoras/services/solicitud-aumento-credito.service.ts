import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { SolicitudAumentoCredito } from '../../../../core/models/solicitud-aumento-credito.model';
import { PaginacionAnidada } from '../../../../core/models/solicitud-transferencia-cliente.model';

@Injectable({ providedIn: 'root' })
export class SolicitudAumentoCreditoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidoras`;

  pendientes(page = 1): Observable<ApiResponse<PaginacionAnidada<SolicitudAumentoCredito>>> {
    const params = new HttpParams().set('page', String(page)).set('estado', 'pendiente');
    return this.http.get<ApiResponse<PaginacionAnidada<SolicitudAumentoCredito>>>(`${this.baseUrl}/aumento-credito`, { params });
  }

  decidir(
    solicitudId: number,
    decision: 'aprobada' | 'rechazada',
    montoOtorgado?: number,
    comentario?: string
  ): Observable<ApiResponse<SolicitudAumentoCredito>> {
    return this.http.put<ApiResponse<SolicitudAumentoCredito>>(`${this.baseUrl}/aumento-credito/${solicitudId}/decidir`, {
      decision,
      monto_otorgado: montoOtorgado,
      comentario
    });
  }
}
