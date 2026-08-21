import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { User } from '../../../../core/models/user.model';

export interface CrearGerenteSucursalPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  sucursal_id: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/usuarios`;

  crearGerenteSucursal(payload: CrearGerenteSucursalPayload): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/gerente-sucursal`, payload);
  }
}
