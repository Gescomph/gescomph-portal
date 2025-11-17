import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { PersonCreateModel, PersonSelectModel, PersonUpdateModel } from '../../models/person.models';
import { PersonService } from '../../services/person/person.service';

@Injectable({ providedIn: 'root' })
export class PersonStore {
  private readonly _persons = new BehaviorSubject<PersonSelectModel[]>([]);
  readonly persons$ = this._persons.asObservable();
  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();
  private readonly _error = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error.asObservable();

  constructor(private personService: PersonService) {
    this.loadAll();
  }

  private get persons(): PersonSelectModel[] {
    return this._persons.getValue();
  }

  private set persons(val: PersonSelectModel[]) {
    this._persons.next(val);
  }

  private startLoading(): void {
    this._loading.next(true);
    this._error.next(null);
  }

  loadAll() {
    this.startLoading();

    this.personService.getAll()
      .pipe(
        tap(list => this.persons = list),
        catchError(err => {
          console.error('Error loading persons', err);
          this._error.next(err?.message ?? 'Error al cargar personas');
          return throwError(() => err);
        }),
        finalize(() => this._loading.next(false))
      )
      .subscribe();
  }

  update(id: number, dto: PersonUpdateModel): Observable<PersonSelectModel> {
    return this.personService.update(id, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: number) {
    return this.personService.delete(id).pipe(
      tap(() => this.persons = this.persons.filter(p => p.id !== id))
    );
  }

  changeActiveStatus(id: number, active: boolean) {
    return this.personService.changeActiveStatus(id, active).pipe(
      tap(() => this.loadAll())
    );
  }
}
