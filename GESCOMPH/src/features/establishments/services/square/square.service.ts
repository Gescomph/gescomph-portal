import { Injectable } from '@angular/core';
import { GenericService } from '../../../../core/services/generic/generic.service';
import { SquareCreateModel, SquareSelectModel, SquareUpdateModel } from '../../models/squares.models';

@Injectable({
  providedIn: 'root'
})
export class SquareService extends GenericService<SquareSelectModel, SquareCreateModel, SquareUpdateModel> {
  protected resource = 'plaza';
}
