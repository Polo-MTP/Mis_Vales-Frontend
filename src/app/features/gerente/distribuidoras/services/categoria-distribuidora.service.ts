import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth-response.model';
import { CategoriaDistribuidora } from '../../../../core/models/distribuidora.model';

@Injectable({ providedIn: 'root' })
export class CategoriaDistribuidoraService {
  private http = inject(HttpClient);

  listar(): Observable<ApiResponse<CategoriaDistribuidora[]>> {
    return this.http.get<ApiResponse<CategoriaDistribuidora[]>>(`${environment.apiUrl}/categorias-distribuidoras`);
  }
}
