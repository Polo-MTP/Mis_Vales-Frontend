import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { SolicitudEdicionCliente } from '../../../../core/models/solicitud-edicion-cliente.model';

@Injectable({ providedIn: 'root' })
export class SolicitudEdicionClienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidora/clientes`;

  pendientes(page = 1): Observable<ApiResponse<PaginatedResponse<SolicitudEdicionCliente>>> {
    const params = new HttpParams().set('page', String(page)).set('estado', 'pendiente');
    return this.http.get<ApiResponse<PaginatedResponse<SolicitudEdicionCliente>>>(`${this.baseUrl}/ediciones`, { params });
  }

  decidir(solicitudId: number, decision: 'aprobada' | 'rechazada', comentario?: string): Observable<ApiResponse<SolicitudEdicionCliente>> {
    return this.http.put<ApiResponse<SolicitudEdicionCliente>>(`${this.baseUrl}/ediciones/${solicitudId}/decidir`, {
      decision,
      comentario
    });
  }
}
