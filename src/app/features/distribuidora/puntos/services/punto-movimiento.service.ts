import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { PuntoMovimiento } from '../../../../core/models/punto-movimiento.model';

@Injectable({ providedIn: 'root' })
export class PuntoMovimientoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidoras`;

  historial(distribuidoraId: number, page = 1): Observable<ApiResponse<PaginatedResponse<PuntoMovimiento>>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ApiResponse<PaginatedResponse<PuntoMovimiento>>>(`${this.baseUrl}/${distribuidoraId}/puntos`, { params });
  }
}
