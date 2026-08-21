import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { MovimientoAutorizado } from '../../../../core/models/movimiento-autorizado.model';

@Injectable({ providedIn: 'root' })
export class MovimientoAutorizadoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/usuarios/mis-autorizaciones`;

  listar(page = 1): Observable<ApiResponse<PaginatedResponse<MovimientoAutorizado>>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ApiResponse<PaginatedResponse<MovimientoAutorizado>>>(this.baseUrl, { params });
  }
}
