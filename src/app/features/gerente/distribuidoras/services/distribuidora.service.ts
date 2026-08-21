import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ActualizarDistribuidoraPayload, DistribuidoraResumen, EstadoDistribuidora, HistorialEstadoDistribuidora } from '../../../../core/models/distribuidora.model';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { PuntoMovimiento } from '../../../../core/models/punto-movimiento.model';

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

  actualizar(id: number, payload: ActualizarDistribuidoraPayload): Observable<DistribuidoraResumen> {
    return this.http.put<DistribuidoraResumen>(`${this.baseUrl}/${id}`, payload);
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

  asignarCredito(
    id: number,
    limiteCredito: number,
    categoriaId: number
  ): Observable<{ message: string; data: DistribuidoraResumen }> {
    return this.http.put<{ message: string; data: DistribuidoraResumen }>(`${this.baseUrl}/${id}/credito`, {
      limite_credito: limiteCredito,
      categoria_id: categoriaId
    });
  }

  historialPuntos(id: number, page = 1): Observable<ApiResponse<PaginatedResponse<PuntoMovimiento>>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ApiResponse<PaginatedResponse<PuntoMovimiento>>>(`${this.baseUrl}/${id}/puntos`, { params });
  }

  historialEstado(id: number): Observable<ApiResponse<HistorialEstadoDistribuidora[]>> {
    return this.http.get<ApiResponse<HistorialEstadoDistribuidora[]>>(`${this.baseUrl}/${id}/historial-estado`);
  }

  subirContrato(id: number, archivo: File): Observable<{ message: string; data: DistribuidoraResumen }> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<{ message: string; data: DistribuidoraResumen }>(`${this.baseUrl}/${id}/contrato`, formData);
  }

  reasignarCoordinador(
    coordinadorOrigenId: number,
    coordinadorDestinoId: number
  ): Observable<{ message: string; data: { distribuidoras_reasignadas: number } }> {
    return this.http.post<{ message: string; data: { distribuidoras_reasignadas: number } }>(`${this.baseUrl}/reasignar-coordinador`, {
      coordinador_origen_id: coordinadorOrigenId,
      coordinador_destino_id: coordinadorDestinoId
    });
  }
}
