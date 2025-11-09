import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstablishmentEventsService {
  private _plazaStateChanged = new Subject<number>(); // puede emitir ID o null
  plazaStateChanged$ = this._plazaStateChanged.asObservable();

  private plazaFilterSelected = new Subject<number>();
  plazaFilterSelected$ = this.plazaFilterSelected.asObservable();

  private _goToEstablishmentsTab = new Subject<void>();
  goToEstablishmentsTab$ = this._goToEstablishmentsTab.asObservable();


  notifyPlazaStateChanged(plazaId: number) {
    this._plazaStateChanged.next(plazaId);
  }

  notifyPlazaFilterSelected(plazaId: number) {
    this.plazaFilterSelected.next(plazaId);
  }


  notifyGoToEstablishmentsTab() {
    this._goToEstablishmentsTab.next();
  }

}
