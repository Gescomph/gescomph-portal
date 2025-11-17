import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ImageModel } from '../../models/images.models';
import { REQ_AUTH_HEADER } from '../../../../shared/var/http.constants';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly baseUrl = `${environment.apiURL}/images`;

  constructor(private http: HttpClient) {}

  uploadImages(entityType: 'Establishment' | 'Plaza', entityId: number, files: File[]): Observable<ImageModel[]> {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f, f.name));

    return this.http.post<ImageModel[]>(
      `${this.baseUrl}/${entityType}/${entityId}`,
      fd,
      { headers: new HttpHeaders({ [REQ_AUTH_HEADER]: '1' }) }
    );
  }

  getImages(entityType: 'Establishment' | 'Plaza', entityId: number): Observable<ImageModel[]> {
    return this.http.get<ImageModel[]>(
      `${this.baseUrl}/${entityType}/${entityId}`,
      { headers: new HttpHeaders({ [REQ_AUTH_HEADER]: '1' }) }
    );
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/id/${id}`,
      { headers: new HttpHeaders({ [REQ_AUTH_HEADER]: '1' }) }
    );
  }

  deleteByPublicId(publicId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/public/${publicId}`,
      { headers: new HttpHeaders({ [REQ_AUTH_HEADER]: '1' }) }
    );
  }
}
