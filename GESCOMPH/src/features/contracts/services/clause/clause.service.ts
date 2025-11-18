import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ClauseCreate, ClauseSelect, ClauseUpdate } from '../../models/clause.models';
import { environment } from '../../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ClauseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURL}/clause`;

  getAll(): Observable<ClauseSelect[]> {
    return this.http.get<ClauseSelect[]>(this.baseUrl);
  }

  create(body: ClauseCreate): Observable<ClauseSelect> {
    return this.http.post<ClauseSelect>(this.baseUrl, body);
  }

  update(body: ClauseUpdate): Observable<ClauseSelect> {
    return this.http.put<ClauseSelect>(`${this.baseUrl}/${body.id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
