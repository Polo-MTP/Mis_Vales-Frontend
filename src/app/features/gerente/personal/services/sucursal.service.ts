import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { ActualizarSucursalPayload, CrearSucursalPayload, Sucursal } from '../../../../core/models/sucursal.model';

@Injectable({ providedIn: 'root' })
export class SucursalService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/sucursales`;

  listar(activas = true): Observable<ApiResponse<Sucursal[]>> {
    return this.http.get<ApiResponse<Sucursal[]>>(this.baseUrl, { params: { activas: String(activas) } });
  }

  crear(payload: CrearSucursalPayload): Observable<ApiResponse<Sucursal>> {
    return this.http.post<ApiResponse<Sucursal>>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: ActualizarSucursalPayload): Observable<ApiResponse<Sucursal>> {
    return this.http.put<ApiResponse<Sucursal>>(`${this.baseUrl}/${id}`, payload);
  }
}
