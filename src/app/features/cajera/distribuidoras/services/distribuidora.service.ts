import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DistribuidoraResumen } from '../../../../core/models/distribuidora.model';

@Injectable({ providedIn: 'root' })
export class DistribuidoraService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/distribuidoras`;

  listar(): Observable<DistribuidoraResumen[]> {
    return this.http.get<DistribuidoraResumen[]>(this.baseUrl);
  }
}
