import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GenericService } from '../../../../core/services/generic/generic.service';
import { ImageModel } from '../../models/images.models';
import { SquareCreateModel, SquareSelectModel, SquareUpdateModel } from '../../models/squares.models';

@Injectable({
  providedIn: 'root'
})
export class SquareService extends GenericService<SquareSelectModel, SquareCreateModel, SquareUpdateModel> {
  protected resource = 'plaza';

  private readonly emptyImages = (): ImageModel[] => [];

  override getAll(): Observable<SquareSelectModel[]> {
    return this.getCards();
  }

  getCards(): Observable<SquareSelectModel[]> {
    return this.http.get<Array<Omit<SquareSelectModel, 'images'> & { images?: ImageModel[] | null }>>(this.url('cards')).pipe(
      map(items =>
        items.map(item => ({
          ...item,
          images: item.images ?? this.emptyImages(),
        })),
      ),
    );
  }
}
