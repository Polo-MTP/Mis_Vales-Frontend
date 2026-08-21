import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Producto, SimulacionProducto } from '../../../../core/models/producto.model';

/** Solo lectura del catálogo activo — GET /productos no usa el envoltorio {success,data}. */
@Injectable({ providedIn: 'root' })
export class ProductoCatalogoService {
  private http = inject(HttpClient);

  listarActivos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos`);
  }

  simular(productoId: number): Observable<SimulacionProducto> {
    return this.http.get<SimulacionProducto>(`${environment.apiUrl}/productos/${productoId}/simulacion`);
  }
}
