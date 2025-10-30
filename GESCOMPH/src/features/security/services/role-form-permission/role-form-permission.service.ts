import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericService } from '../../../../core/services/generic/generic.service';
import { RoleFormPermissionGroupedModel, RoleFormPermissionCreateModel, RoleFormPermissionUpdateModel } from '../../models/role-form-permission.models';

@Injectable({
  providedIn: 'root'
})
export class RoleFormPermissionService extends GenericService<RoleFormPermissionGroupedModel, RoleFormPermissionCreateModel, RoleFormPermissionUpdateModel> {
  protected override resource = 'rolformpermission';

  // Métodos específicos
  override getAll(): Observable<RoleFormPermissionGroupedModel[]> {
    return this.http.get<RoleFormPermissionGroupedModel[]>(this.url('grouped'));
  }

  deleteByGroup(rolId: number, formId: number): Observable<void> {
    return this.http.delete<void>(this.url('group', rolId, formId));
  }

}
