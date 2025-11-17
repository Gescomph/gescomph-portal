import { Injectable } from '@angular/core';
import { GenericService } from '../../../../core/services/generic/generic.service';
import { FormModuleCreateModel, FormModuleSelectModel, FormModuleUpdateModel } from '../../models/form-module.model';
import { AuthGenericService } from '../../../../core/services/generic/auth-generic.service';

@Injectable({
  providedIn: 'root'
})
export class FormModuleService extends AuthGenericService<FormModuleSelectModel, FormModuleCreateModel, FormModuleUpdateModel> {
  protected override resource = 'formModule';

}
