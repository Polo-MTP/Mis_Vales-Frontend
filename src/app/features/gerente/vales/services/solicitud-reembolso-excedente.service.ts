import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { SolicitudReembolsoExcedente } from '../../../../core/models/solicitud-reembolso-excedente.model';
import { PaginacionAnidada } from '../../../../core/models/paginacion-anidada.model';

/** Compartido entre Cajera (solicitar) y Gerente (decidir/listar) -- mismo criterio ya usado
 *  para DistribuidoraService/SolicitudAumentoCreditoService, que también viven bajo
 *  gerente/ aunque los consuma otro rol. */
@Injectable({ providedIn: 'root' })
export class SolicitudReembolsoExcedenteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/vales`;

  solicitar(valeId: number, motivo?: string): Observable<ApiResponse<SolicitudReembolsoExcedente>> {
    return this.http.post<ApiResponse<SolicitudReembolsoExcedente>>(`${this.baseUrl}/${valeId}/reembolso-excedente`, { motivo });
  }

  pendientes(page = 1): Observable<ApiResponse<PaginacionAnidada<SolicitudReembolsoExcedente>>> {
    const params = new HttpParams().set('page', String(page)).set('estado', 'pendiente');
    return this.http.get<ApiResponse<PaginacionAnidada<SolicitudReembolsoExcedente>>>(`${this.baseUrl}/reembolso-excedente`, { params });
  }

  misSolicitudes(page = 1): Observable<ApiResponse<PaginacionAnidada<SolicitudReembolsoExcedente>>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ApiResponse<PaginacionAnidada<SolicitudReembolsoExcedente>>>(`${this.baseUrl}/reembolso-excedente`, { params });
  }

  decidir(solicitudId: number, decision: 'aprobada' | 'rechazada', comentario?: string): Observable<ApiResponse<SolicitudReembolsoExcedente>> {
    return this.http.put<ApiResponse<SolicitudReembolsoExcedente>>(`${this.baseUrl}/reembolso-excedente/${solicitudId}/decidir`, {
      decision,
      comentario
    });
  }
}
