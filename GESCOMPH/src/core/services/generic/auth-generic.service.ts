import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpHeaders } from '@angular/common/http';
import { REQ_AUTH_HEADER } from '../../../shared/var/http.constants';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthGenericService<
  TModel,
  TCreate = unknown,
  TUpdate = Partial<TCreate>,
  ID = number
> extends GenericService<TModel, TCreate, TUpdate, ID> {

  protected get authedHeaders(): HttpHeaders {
    return new HttpHeaders({ [REQ_AUTH_HEADER]: '1' });
  }

  override getAll() {
    return this.http.get<TModel[]>(this.url(), { headers: this.authedHeaders });
  }

  override getById(id: ID) {
    return this.http.get<TModel>(this.url(id as any), { headers: this.authedHeaders });
  }

  override create(dto: TCreate) {
    return this.http.post<TModel>(this.url(), dto, { headers: this.authedHeaders });
  }

  override update(id: ID, dto: TUpdate) {
    return this.http.put<TModel>(this.url(id as any), dto, { headers: this.authedHeaders });
  }

  override delete(id: ID) {
    return this.http.delete<void>(this.url(id as any), { headers: this.authedHeaders });
  }

  override deleteLogic(id: ID) {
    return this.http.patch<void>(`${this.url(id as any)}/soft-delete`, null, { headers: this.authedHeaders });
  }

  override changeActiveStatus(id: ID, active: boolean) {
    return this.http.patch<TModel>(this.url(id as any, 'estado'), { active }, { headers: this.authedHeaders });
  }
}
