import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { AbonoConciliacion, EstadoAbonoConciliacion, ResumenImportacionConciliacion } from '../../../../core/models/conciliacion.model';
import { SolicitudConciliacion } from '../../../../core/models/solicitud-conciliacion.model';

@Injectable({ providedIn: 'root' })
export class ConciliacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/conciliaciones`;

  listar(page = 1, estado?: EstadoAbonoConciliacion): Observable<ApiResponse<PaginatedResponse<AbonoConciliacion>>> {
    let params = new HttpParams().set('page', String(page));
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<ApiResponse<PaginatedResponse<AbonoConciliacion>>>(this.baseUrl, { params });
  }

  importar(archivo: File): Observable<ApiResponse<ResumenImportacionConciliacion>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ApiResponse<ResumenImportacionConciliacion>>(`${this.baseUrl}/importar`, formData);
  }

  solicitarAutorizacion(abonoId: number, relacionId: number, motivo: string): Observable<ApiResponse<SolicitudConciliacion>> {
    return this.http.post<ApiResponse<SolicitudConciliacion>>(`${this.baseUrl}/${abonoId}/solicitar-autorizacion`, {
      relacion_id: relacionId,
      motivo
    });
  }

  misSolicitudes(page = 1): Observable<ApiResponse<PaginatedResponse<SolicitudConciliacion>>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ApiResponse<PaginatedResponse<SolicitudConciliacion>>>(`${this.baseUrl}/autorizaciones`, { params });
  }

  ejecutar(abonoId: number, solicitudId: number): Observable<ApiResponse<AbonoConciliacion>> {
    return this.http.post<ApiResponse<AbonoConciliacion>>(`${this.baseUrl}/${abonoId}/conciliar-manual`, {
      solicitud_id: solicitudId
    });
  }
}
