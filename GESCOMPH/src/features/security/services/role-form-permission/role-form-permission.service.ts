import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  RoleFormPermissionCreateModel,
  RoleFormPermissionGroupedModel,
  RoleFormPermissionUpdateModel
} from '../../models/role-form-permission.models';
import { AuthGenericService } from '../../../../core/services/generic/auth-generic.service';

@Injectable({
  providedIn: 'root'
})
export class RoleFormPermissionService
  extends AuthGenericService<RoleFormPermissionGroupedModel, RoleFormPermissionCreateModel, RoleFormPermissionUpdateModel>
{
  protected override resource = 'rolformpermission';

  // Métodos específicos

  override getAll(): Observable<RoleFormPermissionGroupedModel[]> {
    return this.http.get<RoleFormPermissionGroupedModel[]>(
      this.url('grouped'),
      { headers: this.authedHeaders }   //  <<--- importante
    );
  }

  deleteByGroup(rolId: number, formId: number): Observable<void> {
    return this.http.delete<void>(
      this.url('group', rolId, formId),
      { headers: this.authedHeaders }   //  <<--- importante
    );
  }
}
