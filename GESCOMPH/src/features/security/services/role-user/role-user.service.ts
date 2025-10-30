import { Injectable } from '@angular/core';
import { GenericService } from '../../../../core/services/generic/generic.service';
import { RoleUserCreateModel, RoleUserSelectModel, RoleUserUpdateModel } from '../../models/role-user.models';

@Injectable({
  providedIn: 'root'
})
export class RolUserService extends GenericService<RoleUserSelectModel, RoleUserCreateModel, RoleUserUpdateModel> {
  protected resource = 'rolUser';

  // You can add any additional methods specific to rol-user service here
  // For example, if you need to fetch rol-users by a specific criteria
  // getRolUsersByCriteria(criteria: any): Observable<RolUserSelectModel[]> {
  //   return this.http.get<RolUserSelectModel[]>(`${this.baseUrl}/${this.resource}/criteria`, { params: criteria });
  // }
}
