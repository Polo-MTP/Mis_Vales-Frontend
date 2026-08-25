import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { User } from '../../../../core/models/user.model';
import { DatosPersonalesPayload } from '../../../../shared/utils/datos-personales-form.util';

/** El alta de cualquier rol de staff ahora captura el mismo expediente que la alta de una
 *  distribuidora (Datos Personales + Dirección + RFC + Referencia Laboral, ver
 *  DatosPersonalesPayload) -- 'name' ya no se manda, el backend lo calcula de nombre/apellidos. */
export interface CrearGerenteSucursalPayload extends DatosPersonalesPayload {
  email: string;
  sucursal_id: number;
}

export interface CrearGerenteGeneralPayload extends DatosPersonalesPayload {
  email: string;
}

export type RolPersonalSucursal = 'Coordinador' | 'Verificador' | 'Cajera';

export interface CrearPersonalSucursalPayload extends DatosPersonalesPayload {
  rol: RolPersonalSucursal;
  email: string;
  sucursal_id?: number;
  gerente_id?: number;
}

export interface ReasignarPersonalPayload {
  gerente_origen_id: number;
  gerente_destino_id: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/usuarios`;

  /** Lista usuarios activos, opcionalmente filtrados por rol -- ej. para saber si ya existe un
   *  Gerente General antes de mostrar el formulario para dar de alta otro (el backend lo
   *  rechaza de todas formas, esto solo evita mostrar un formulario que va a fallar seguro). */
  listar(filtroRol?: string): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.baseUrl, {
      params: filtroRol ? { 'filter[role]': filtroRol } : {}
    });
  }

  crearGerenteSucursal(payload: CrearGerenteSucursalPayload): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/gerente-sucursal`, payload);
  }

  crearGerenteGeneral(payload: CrearGerenteGeneralPayload): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/gerente-general`, payload);
  }

  crearPersonalSucursal(payload: CrearPersonalSucursalPayload): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/personal`, payload);
  }

  reasignarPersonal(payload: ReasignarPersonalPayload): Observable<ApiResponse<{ personal_reasignado: number }>> {
    return this.http.post<ApiResponse<{ personal_reasignado: number }>>(`${this.baseUrl}/reasignar-gerente`, payload);
  }
}
