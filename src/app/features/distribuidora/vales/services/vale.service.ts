import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { SolicitarValePayload, Vale } from '../../../../core/models/vale.model';

@Injectable({ providedIn: 'root' })
export class ValeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/vales`;

  listar(page = 1, estado?: string): Observable<ApiResponse<PaginatedResponse<Vale>>> {
    let params = new HttpParams().set('page', String(page));
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<ApiResponse<PaginatedResponse<Vale>>>(this.baseUrl, { params });
  }

  solicitar(payload: SolicitarValePayload): Observable<ApiResponse<Vale>> {
    return this.http.post<ApiResponse<Vale>>(this.baseUrl, payload);
  }
}
