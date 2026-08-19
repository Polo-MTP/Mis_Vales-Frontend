import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { SolicitudTransferenciaCliente } from '../../../../core/models/solicitud-transferencia-cliente.model';
import { PaginacionAnidada } from '../../../../core/models/paginacion-anidada.model';

@Injectable({ providedIn: 'root' })
export class SolicitudTransferenciaClienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidora/clientes`;

  pendientes(page = 1): Observable<ApiResponse<PaginacionAnidada<SolicitudTransferenciaCliente>>> {
    const params = new HttpParams().set('page', String(page)).set('estado', 'pendiente_autorizacion');
    return this.http.get<ApiResponse<PaginacionAnidada<SolicitudTransferenciaCliente>>>(`${this.baseUrl}/transferencias`, { params });
  }

  decidir(solicitudId: number, decision: 'autorizada' | 'rechazada', comentario?: string): Observable<ApiResponse<SolicitudTransferenciaCliente>> {
    return this.http.put<ApiResponse<SolicitudTransferenciaCliente>>(`${this.baseUrl}/transferencias/${solicitudId}/decidir`, {
      decision,
      comentario
    });
  }
}
