import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { PaginatedResponse } from '../../../../core/models/user.model';
import { Cliente } from '../../../../core/models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidora/clientes`;

  buscar(search?: string, page = 1): Observable<ApiResponse<PaginatedResponse<Cliente>>> {
    let params = new HttpParams().set('page', String(page));
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ApiResponse<PaginatedResponse<Cliente>>>(this.baseUrl, { params });
  }
}
