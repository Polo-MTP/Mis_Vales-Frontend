import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';

export interface PresignedUrlData {
  upload_url: string;
  path: string;
  /** Ya NO sirve para mostrar el archivo directo (los uploads quedan privados por defecto
   *  desde el fix de seguridad de Spaces) -- pedir un read_url fresco con getReadUrl(path). */
  public_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Solicita al backend una URL prefirmada de S3/Spaces para subida directa.
   */
  getPresignedUrl(fileName: string, contentType: string, folder: string = 'uploads'): Observable<ApiResponse<PresignedUrlData>> {
    const params = new URLSearchParams({
      file_name: fileName,
      content_type: contentType,
      folder
    });

    return this.http.get<ApiResponse<PresignedUrlData>>(
      `${this.apiUrl}/upload-url?${params.toString()}`
    );
  }

  /**
   * Sube el archivo directamente al bucket de DigitalOcean Spaces usando la URL prefirmada.
   * Sin header de ACL a propósito: el ACL ('private') ya viene incluido en la firma de la
   * URL prefirmada (ver SpacesStorageService::generatePresignedUploadUrl en el backend) --
   * mandar un x-amz-acl distinto aquí no lo sobreescribe, solo hace que la firma no coincida
   * y el PUT falle con SignatureDoesNotMatch.
   */
  uploadToSpace(uploadUrl: string, file: File): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders({
      'Content-Type': file.type || 'application/octet-stream'
    });

    return this.http.put<any>(uploadUrl, file, {
      headers,
      observe: 'response',
      responseType: 'text' as 'json'
    });
  }

  /**
   * Pide un link temporal (~15 min) para LEER un archivo que se subió privado. Nunca guardar
   * este read_url ni reusarlo después de que expire -- pedir uno fresco cada vez que haga falta
   * mostrar el archivo.
   */
  getReadUrl(pathOrPublicUrl: string): Observable<ApiResponse<{ read_url: string }>> {
    const params = new URLSearchParams({ path: pathOrPublicUrl });
    return this.http.get<ApiResponse<{ read_url: string }>>(`${this.apiUrl}/read-url?${params.toString()}`);
  }

  /**
   * Flujo completo: obtiene la URL prefirmada y sube el archivo en un solo paso.
   */
  uploadFile(file: File, folder: string = 'uploads'): Observable<{ path: string; public_url: string }> {
    return new Observable((observer) => {
      this.getPresignedUrl(file.name, file.type || 'application/octet-stream', folder).subscribe({
        next: (res) => {
          if (!res.success || !res.data) {
            observer.error(new Error(res.message || 'Error al obtener la URL de subida.'));
            return;
          }

          const { upload_url, path, public_url } = res.data;
          this.uploadToSpace(upload_url, file).subscribe({
            next: () => {
              observer.next({ path, public_url });
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
