// services/user.service.ts
import { Injectable } from '@angular/core';
import { UserCreateModel, UserSelectModel, UserUpdateModel } from '../../models/user.models';
import { GenericService } from '../../../../core/services/generic/generic.service';

@Injectable({ providedIn: 'root' })
export class UserService extends GenericService<UserSelectModel, UserCreateModel, UserUpdateModel> {
  protected resource = 'user';
  
  deleteLogicFull(id: number) {
    return this.http.patch(`${this.baseUrl}/user/${id}/soft`, {}, {
      withCredentials: true
    });
  }

}
