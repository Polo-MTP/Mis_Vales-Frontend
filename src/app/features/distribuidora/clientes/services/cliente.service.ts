import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import {
  Cliente,
  CrearClientePayload,
  DistribuidoraPerfil,
  EditarClientePayload
} from '../../../../core/models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidora`;

  miPerfil(): Observable<ApiResponse<DistribuidoraPerfil>> {
    return this.http.get<ApiResponse<DistribuidoraPerfil>>(`${this.baseUrl}/perfil`);
  }

  listar(page = 1, search?: string, estado?: boolean, perPage?: number): Observable<ApiResponse<PaginatedResponse<Cliente>>> {
    let params = new HttpParams().set('page', String(page));

    if (search) {
      params = params.set('search', search);
    }

    if (estado !== undefined) {
      params = params.set('estado', String(estado));
    }

    if (perPage !== undefined) {
      params = params.set('per_page', String(perPage));
    }

    return this.http.get<ApiResponse<PaginatedResponse<Cliente>>>(`${this.baseUrl}/clientes`, { params });
  }

  crear(payload: CrearClientePayload): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.baseUrl}/clientes`, payload);
  }

  detalle(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/${id}`);
  }

  actualizar(id: number, payload: EditarClientePayload): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/${id}`, payload);
  }

  cambiarEstado(id: number, estado: boolean): Observable<ApiResponse<Cliente>> {
    return this.http.patch<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/${id}/estado`, { estado });
  }

  buscarPorCurp(curp: string): Observable<ApiResponse<Cliente>> {
    const params = new HttpParams().set('curp', curp);
    return this.http.get<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/buscar-por-curp`, { params });
  }
}
