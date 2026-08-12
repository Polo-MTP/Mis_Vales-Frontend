import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { EditarClientePayload } from '../../../../core/models/cliente.model';
import { SolicitudEdicionCliente } from '../../../../core/models/solicitud-edicion-cliente.model';

@Injectable({ providedIn: 'root' })
export class SolicitudEdicionClienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidora/clientes`;

  solicitar(clienteId: number, payload: EditarClientePayload, motivo: string): Observable<ApiResponse<SolicitudEdicionCliente>> {
    return this.http.post<ApiResponse<SolicitudEdicionCliente>>(`${this.baseUrl}/${clienteId}/solicitar-edicion`, {
      datos_personales: payload.datos_personales ?? {},
      direccion: payload.direccion ?? {},
      motivo
    });
  }

  misSolicitudes(page = 1): Observable<ApiResponse<PaginatedResponse<SolicitudEdicionCliente>>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ApiResponse<PaginatedResponse<SolicitudEdicionCliente>>>(`${this.baseUrl}/ediciones`, { params });
  }

  aplicar(clienteId: number, solicitudId: number): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${clienteId}/editar-datos`, {
      solicitud_id: solicitudId
    });
  }
}
