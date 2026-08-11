import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { AbonoConciliacion, EstadoAbonoConciliacion, ResumenImportacionConciliacion } from '../../../../core/models/conciliacion.model';

@Injectable({ providedIn: 'root' })
export class ConciliacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/conciliaciones`;

  listar(page = 1, estado?: EstadoAbonoConciliacion, relacionId?: number): Observable<ApiResponse<PaginatedResponse<AbonoConciliacion>>> {
    let params = new HttpParams().set('page', String(page));
    if (estado) {
      params = params.set('estado', estado);
    }
    if (relacionId) {
      params = params.set('relacion_id', String(relacionId));
    }
    return this.http.get<ApiResponse<PaginatedResponse<AbonoConciliacion>>>(this.baseUrl, { params });
  }

  importar(archivo: File): Observable<ApiResponse<ResumenImportacionConciliacion>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ApiResponse<ResumenImportacionConciliacion>>(`${this.baseUrl}/importar`, formData);
  }

  conciliarManual(abonoId: number, relacionId: number, motivo: string): Observable<ApiResponse<AbonoConciliacion>> {
    return this.http.post<ApiResponse<AbonoConciliacion>>(`${this.baseUrl}/${abonoId}/conciliar-manual`, {
      relacion_id: relacionId,
      motivo
    });
  }
}
