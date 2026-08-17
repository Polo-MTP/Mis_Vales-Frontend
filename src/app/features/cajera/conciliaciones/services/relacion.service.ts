import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { Relacion } from '../../../../core/models/relacion.model';

@Injectable({ providedIn: 'root' })
export class RelacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/relaciones`;

  /** Scopeado a la sucursal de la cajera por el backend; ella solo busca dentro de eso. */
  buscar(referenciaPago: string): Observable<ApiResponse<PaginatedResponse<Relacion>>> {
    const params = new HttpParams().set('referencia_pago', referenciaPago).set('per_page', '10');
    return this.http.get<ApiResponse<PaginatedResponse<Relacion>>>(this.baseUrl, { params });
  }
}
