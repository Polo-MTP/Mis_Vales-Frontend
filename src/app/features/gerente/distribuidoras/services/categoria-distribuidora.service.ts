import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { CategoriaDistribuidora, CategoriaDistribuidoraPayload } from '../../../../core/models/distribuidora.model';

@Injectable({ providedIn: 'root' })
export class CategoriaDistribuidoraService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/categorias-distribuidoras`;

  listar(incluirInactivas = false): Observable<ApiResponse<CategoriaDistribuidora[]>> {
    let params = new HttpParams();
    if (incluirInactivas) {
      params = params.set('activas', 'false');
    }
    return this.http.get<ApiResponse<CategoriaDistribuidora[]>>(this.baseUrl, { params });
  }

  crear(payload: CategoriaDistribuidoraPayload): Observable<ApiResponse<CategoriaDistribuidora>> {
    return this.http.post<ApiResponse<CategoriaDistribuidora>>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: CategoriaDistribuidoraPayload): Observable<ApiResponse<CategoriaDistribuidora>> {
    return this.http.put<ApiResponse<CategoriaDistribuidora>>(`${this.baseUrl}/${id}`, payload);
  }

  desactivar(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
