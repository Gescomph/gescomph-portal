import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DepartmentCreate, DepartmentSelectModel, DepartmentUpdate } from '../../models/department.models';
import { DepartmentService } from '../../services/department/department.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentStore {
  private readonly _departments = new BehaviorSubject<DepartmentSelectModel[]>([]);
  readonly departments$ = this._departments.asObservable();
  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();
  private readonly _error = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error.asObservable();

  constructor(private departmentService: DepartmentService) {
    this.loadAll();
  }

  private get departments(): DepartmentSelectModel[] {
    return this._departments.getValue();
  }

  private set departments(val: DepartmentSelectModel[]) {
    this._departments.next(val);
  }

  private startLoading(): void {
    this._loading.next(true);
    this._error.next(null);
  }

  // Carga inicial
  loadAll() {
    this.startLoading();

    this.departmentService.getAll().pipe(
      tap(data => this.departments = data),
      catchError(err => {
        console.error('Error loading departments', err);
        this._error.next(err?.message ?? 'Error al cargar departamentos');
        return throwError(() => err);
      }),
      finalize(() => this._loading.next(false))
    ).subscribe();
  }

  create(department: DepartmentCreate): Observable<DepartmentSelectModel> {
    return this.departmentService.create(department as DepartmentSelectModel).pipe(
      tap(() => this.loadAll())
    );
  }

  update(updateDto: DepartmentUpdate): Observable<DepartmentSelectModel> {
    return this.departmentService.update(updateDto.id, updateDto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: number): Observable<void> {
    return this.departmentService.delete(id).pipe(
      tap(() => {
        this.departments = this.departments.filter(d => d.id !== id);
      })
    );
  }


  changeActiveStatus(id: number, active: boolean): Observable<DepartmentSelectModel> {
    return this.departmentService.changeActiveStatus(id, active).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }
}
