import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ActualizarProductoPayload, CrearProductoPayload, Producto } from '../../../../core/models/producto.model';

/**
 * Igual que /distribuidoras, este controlador NO usa el envoltorio {success,message,data}:
 * regresa el arreglo / objeto directo. Verificado en vivo contra el backend real.
 */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/productos`;

  listar(soloActivos = false): Observable<Producto[]> {
    const params = new HttpParams().set('activos', String(soloActivos));
    return this.http.get<Producto[]>(this.baseUrl, { params });
  }

  crear(payload: CrearProductoPayload): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: ActualizarProductoPayload): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, payload);
  }

  desactivar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
