import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  EstablishmentSelect,
  EstablishmentCreate,
  EstablishmentUpdate,
  EstablishmentCard,
  GetAllOptions
} from '../../models/establishment.models';

@Injectable({ providedIn: 'root' })
export class EstablishmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURL}/Establishments`;
  private readonly defaultLimit = environment.establishmentsDefaultLimit;

  /** Construye HttpParams dinámicamente */
  private buildParams(options?: GetAllOptions): HttpParams {
    let params = new HttpParams();
    const limit = options?.limit ?? this.defaultLimit;
    if (options?.activeOnly) params = params.set('activeOnly', 'true');
    if (limit && limit > 0) params = params.set('limit', limit.toString());
    return params;
  }

  // ======== CONSULTAS ========

  getAll(options?: GetAllOptions): Observable<EstablishmentSelect[]> {
    return this.http.get<EstablishmentSelect[]>(this.baseUrl, {
      params: this.buildParams(options)
    });
  }

  getByPlaza(plazaId: number, options?: GetAllOptions): Observable<EstablishmentSelect[]> {
    return this.http.get<EstablishmentSelect[]>(`${this.baseUrl}/plaza/${plazaId}`, {
      params: this.buildParams(options)
    });
  }

  getById(id: number, activeOnly?: boolean): Observable<EstablishmentSelect> {
    const params = activeOnly ? new HttpParams().set('activeOnly', 'true') : undefined;
    return this.http.get<EstablishmentSelect>(`${this.baseUrl}/${id}`, { params });
  }

  getCards(options?: GetAllOptions): Observable<EstablishmentCard[]> {
    return this.http.get<EstablishmentCard[]>(`${this.baseUrl}/cards`, {
      params: this.buildParams(options)
    });
  }

  getCardsByPlaza(plazaId: number, options?: GetAllOptions): Observable<EstablishmentCard[]> {
    return this.http.get<EstablishmentCard[]>(`${this.baseUrl}/cards/plaza/${plazaId}`, {
      params: this.buildParams(options)
    });
  }

  // Conveniencias explícitas (opcionales)
  getAllAny(limit?: number) { return this.getAll({ limit }); }
  getAllActive(limit?: number) { return this.getAll({ activeOnly: true, limit }); }
  getCardsAny() { return this.getCards(); }
  getCardsActive() { return this.getCards({ activeOnly: true }); }

  // ======== CRUD ========

  create(dto: EstablishmentCreate): Observable<EstablishmentSelect> {
    const { files, images, imagesToDelete, ...body } = dto as any;
    return this.http.post<EstablishmentSelect>(this.baseUrl, body);
  }

  update(dto: EstablishmentUpdate): Observable<EstablishmentSelect> {
    if (!dto.id) throw new Error('ID del establecimiento es obligatorio');
    return this.http.put<EstablishmentSelect>(`${this.baseUrl}/${dto.id}`, dto);
    }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  deleteLogic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/logic`);
  }

  changeActiveStatus(id: number, active: boolean): Observable<EstablishmentSelect> {
    return this.http.patch<EstablishmentSelect>(`${this.baseUrl}/${id}/estado`, { active });
  }
}
