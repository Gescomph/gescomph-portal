import { Injectable } from '@angular/core';
import { AuthGenericService } from '../../../../core/services/generic/auth-generic.service';
import { RoleCreateModel, RoleSelectModel, RoleUpdateModel } from '../../models/role.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends AuthGenericService<RoleSelectModel, RoleCreateModel, RoleUpdateModel> {
  protected resource = 'rol';
  // You can add any additional methods specific to role service here
  // For example, if you need to fetch roles by a specific criteria
  // getRolesByCriteria(criteria: any): Observable<RoleSelectModel[]> {
  //   return this.http.get<RoleSelectModel[]>(`${this.baseUrl}/${this.resource}/criteria`, { params: criteria });
  // }
}
