import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import { EstadoCuenta } from '../models/estado-cuenta.model';

@Injectable({ providedIn: 'root' })
export class EstadoCuentaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidoras`;

  obtener(distribuidoraId: number): Observable<ApiResponse<EstadoCuenta>> {
    return this.http.get<ApiResponse<EstadoCuenta>>(`${this.baseUrl}/${distribuidoraId}/estado-cuenta`);
  }
}
