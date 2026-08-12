import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PuntoMovimiento } from '../../../../core/models/punto-movimiento.model';

@Injectable({ providedIn: 'root' })
export class PuntoCanjeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidoras`;

  canjear(distribuidoraId: number, cantidad: number, motivo: string): Observable<ApiResponse<PuntoMovimiento>> {
    return this.http.post<ApiResponse<PuntoMovimiento>>(`${this.baseUrl}/${distribuidoraId}/puntos/canjear`, {
      cantidad,
      motivo
    });
  }
}
