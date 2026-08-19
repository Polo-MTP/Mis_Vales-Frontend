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

  /**
   * Valida en persona los datos del cliente contra el vale. Paso obligatorio antes de autorizar.
   * ineVerificada/comprobanteDomicilioVerificado son siempre obligatorios (el backend rechaza
   * si falta cualquiera de los dos, o si alguno viene en false). clabe (18 dígitos) solo hace
   * falta la primera vez que se valida un vale de ese cliente; en vales futuros no hace falta.
   */
  validar(
    valeId: number,
    ineVerificada: boolean,
    comprobanteDomicilioVerificado: boolean,
    clabe?: string
  ): Observable<ApiResponse<Vale>> {
    return this.http.put<ApiResponse<Vale>>(`${this.baseUrl}/${valeId}/validar`, {
      ine_verificada: ineVerificada,
      comprobante_domicilio_verificado: comprobanteDomicilioVerificado,
      clabe: clabe || undefined
    });
  }

  /** Autoriza/paga el vale al cliente en caja. Solo Cajera; requiere que ya esté 'validado'. */
  autorizar(valeId: number): Observable<ApiResponse<Vale>> {
    return this.http.put<ApiResponse<Vale>>(`${this.baseUrl}/${valeId}/autorizar`, {});
  }
}
