import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DistribuidoraResumen, EstadoDistribuidora } from '../../../../core/models/distribuidora.model';

/**
 * A diferencia del resto de la API, estos endpoints (GET /distribuidoras) NO usan
 * el envoltorio {success, message, data}: regresan el arreglo / objeto directo,
 * y las acciones de escritura regresan {message, data} sin `success`. Verificado
 * en vivo contra el backend real.
 */
@Injectable({ providedIn: 'root' })
export class DistribuidoraService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidoras`;

  listar(): Observable<DistribuidoraResumen[]> {
    return this.http.get<DistribuidoraResumen[]>(this.baseUrl);
  }

  detalle(id: number): Observable<DistribuidoraResumen> {
    return this.http.get<DistribuidoraResumen>(`${this.baseUrl}/${id}`);
  }

  cambiarEstado(
    id: number,
    estado: EstadoDistribuidora,
    motivo?: string
  ): Observable<{ message: string; data: DistribuidoraResumen }> {
    return this.http.put<{ message: string; data: DistribuidoraResumen }>(`${this.baseUrl}/${id}/estado`, {
      estado,
      motivo
    });
  }
}
