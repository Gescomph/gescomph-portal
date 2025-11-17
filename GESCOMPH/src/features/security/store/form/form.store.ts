import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { FormCreateModel, FormSelectModel, FormUpdateModel } from '../../models/form.models';
import { FormService } from '../../services/form/form.service';

@Injectable({
  providedIn: 'root'
})
export class FormStore {
  private readonly _forms = new BehaviorSubject<FormSelectModel[]>([]);
  readonly forms$ = this._forms.asObservable();
  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();
  private readonly _error = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error.asObservable();

  constructor(private formService: FormService) {
    this.loadAll();
  }

  private get forms(): FormSelectModel[] {
    return this._forms.getValue();
  }

  private set forms(val: FormSelectModel[]) {
    this._forms.next(val);
  }

  private startLoading(): void {
    this._loading.next(true);
    this._error.next(null);
  }

  loadAll() {
    this.startLoading();

    this.formService.getAll().pipe(
      tap(data => this.forms = data),
      catchError(err => {
        console.error('Error loading forms', err);
        this._error.next(err?.message ?? 'Error al cargar formularios');
        return throwError(() => err);
      }),
      finalize(() => this._loading.next(false))
    ).subscribe();
  }

  create(form: FormCreateModel): Observable<FormSelectModel> {
    return this.formService.create(form).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }

  update(id: number, updateDto: FormUpdateModel): Observable<FormSelectModel> {
    return this.formService.update(id, updateDto).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.formService.delete(id).pipe(
      tap(() => {
        this.forms = this.forms.filter(c => c.id !== id);
      })
    );
  }

  deleteLogic(id: number): Observable<void> {
    return this.formService.deleteLogic(id).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }
  changeActiveStatus(id: number, active: boolean): Observable<FormSelectModel> {
    return this.formService.changeActiveStatus(id, active).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }
}
