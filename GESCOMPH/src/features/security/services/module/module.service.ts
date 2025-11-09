import { Injectable } from '@angular/core';
import { AuthGenericService } from '../../../../core/services/generic/auth-generic.service';
import { ModuleCreateModel, ModuleSelectModel, ModuleUpdateModel } from '../../models/module.models';

@Injectable({
  providedIn: 'root'
})
export class ModuleService extends AuthGenericService<ModuleSelectModel, ModuleCreateModel, ModuleUpdateModel> {
  protected override resource = 'module';
} {
}
