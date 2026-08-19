import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import {
  PaginacionAnidada,
  SolicitudTransferenciaCliente
} from '../../../../core/models/solicitud-transferencia-cliente.model';

@Injectable({ providedIn: 'root' })
export class SolicitudTransferenciaClienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidora/clientes`;

  misSolicitudes(page = 1): Observable<ApiResponse<PaginacionAnidada<SolicitudTransferenciaCliente>>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ApiResponse<PaginacionAnidada<SolicitudTransferenciaCliente>>>(`${this.baseUrl}/transferencias`, { params });
  }

  solicitar(clienteId: number, motivo: string): Observable<ApiResponse<SolicitudTransferenciaCliente>> {
    return this.http.post<ApiResponse<SolicitudTransferenciaCliente>>(`${this.baseUrl}/${clienteId}/solicitar-transferencia`, { motivo });
  }

  aceptar(solicitudId: number, decision: 'aceptada' | 'rechazada'): Observable<ApiResponse<SolicitudTransferenciaCliente>> {
    return this.http.put<ApiResponse<SolicitudTransferenciaCliente>>(`${this.baseUrl}/transferencias/${solicitudId}/aceptar`, { decision });
  }
}
