import { Injectable } from '@angular/core';
import { GenericService } from '../../../../core/services/generic/generic.service';
import {
  SystemParameterCreateModel,
  SystemParameterSelectModel,
  SystemParameterUpdateModel
} from '../../models/system-parameter.models';

@Injectable({
  providedIn: 'root'
})
export class SystemParametersService extends GenericService<
  SystemParameterSelectModel,
  SystemParameterCreateModel,
  SystemParameterUpdateModel
> {
  protected override resource = 'SystemParameter';

}
