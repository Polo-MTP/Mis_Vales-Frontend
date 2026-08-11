import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { DistribuidoraMorosa } from '../../../../core/models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reportes`;

  morosos(): Observable<ApiResponse<DistribuidoraMorosa[]>> {
    return this.http.get<ApiResponse<DistribuidoraMorosa[]>>(`${this.baseUrl}/morosos`);
  }
}
