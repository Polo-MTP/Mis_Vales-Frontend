import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { Vale } from '../../../../core/models/vale.model';

@Injectable({ providedIn: 'root' })
export class ValeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/vales`;

  /** Solo lectura: el backend ya la limita a las distribuidoras de su propia sucursal. */
  listar(page = 1, estado?: string): Observable<ApiResponse<PaginatedResponse<Vale>>> {
    let params = new HttpParams().set('page', String(page));
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<ApiResponse<PaginatedResponse<Vale>>>(this.baseUrl, { params });
  }

  /** Valida en persona los datos del cliente contra el vale. Paso obligatorio antes de autorizar. */
  validar(valeId: number): Observable<ApiResponse<Vale>> {
    return this.http.put<ApiResponse<Vale>>(`${this.baseUrl}/${valeId}/validar`, {});
  }

  /** Autoriza/paga el vale al cliente en caja. Solo Cajera; requiere que ya esté 'validado'. */
  autorizar(valeId: number): Observable<ApiResponse<Vale>> {
    return this.http.put<ApiResponse<Vale>>(`${this.baseUrl}/${valeId}/autorizar`, {});
  }
}
