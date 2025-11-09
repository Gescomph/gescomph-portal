import { Injectable } from '@angular/core';
import { AuthGenericService } from '../../../../core/services/generic/auth-generic.service';
import { FormCreateModel, FormSelectModel, FormUpdateModel } from '../../models/form.models';

@Injectable({
  providedIn: 'root'
})
export class FormService extends AuthGenericService<FormSelectModel, FormCreateModel, FormUpdateModel> {
  protected override resource = 'form';

}
