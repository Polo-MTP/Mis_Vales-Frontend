import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);

  listar(role?: string): Observable<ApiResponse<User[]>> {
    let params = new HttpParams();

    if (role) {
      params = params.set('filter[role]', role);
    }

    return this.http.get<ApiResponse<User[]>>(`${environment.apiUrl}/usuarios`, { params });
  }
}
