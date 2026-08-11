import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import {
  CambiarConfiguracionFechasPayload,
  CambiarConfiguracionPayload,
  Configuracion,
  ConfiguracionFechas
} from '../../../../core/models/configuracion.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/configuraciones`;

  listar(): Observable<ApiResponse<Configuracion[]>> {
    return this.http.get<ApiResponse<Configuracion[]>>(this.baseUrl);
  }

  cambiarValor(payload: CambiarConfiguracionPayload): Observable<ApiResponse<Configuracion>> {
    return this.http.post<ApiResponse<Configuracion>>(this.baseUrl, payload);
  }

  historial(clave: string): Observable<ApiResponse<Configuracion[]>> {
    return this.http.get<ApiResponse<Configuracion[]>>(`${this.baseUrl}/historial/${clave}`);
  }

  listarFechas(): Observable<ApiResponse<ConfiguracionFechas[]>> {
    return this.http.get<ApiResponse<ConfiguracionFechas[]>>(`${this.baseUrl}/fechas`);
  }

  cambiarFechas(payload: CambiarConfiguracionFechasPayload): Observable<ApiResponse<ConfiguracionFechas>> {
    return this.http.post<ApiResponse<ConfiguracionFechas>>(`${this.baseUrl}/fechas`, payload);
  }

  historialFechas(sucursalId?: number): Observable<ApiResponse<ConfiguracionFechas[]>> {
    let params = new HttpParams();
    if (sucursalId !== undefined) {
      params = params.set('sucursal_id', String(sucursalId));
    }
    return this.http.get<ApiResponse<ConfiguracionFechas[]>>(`${this.baseUrl}/fechas/historial`, { params });
  }
}
