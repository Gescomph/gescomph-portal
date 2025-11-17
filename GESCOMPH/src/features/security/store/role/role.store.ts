import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { IsActive } from '../../../../core/models/auth/is-active.models';
import { RoleCreateModel, RoleSelectModel, RoleUpdateModel } from '../../models/role.models';
import { RoleService } from '../../services/role/role.service';

@Injectable({
  providedIn: 'root'
})
export class RoleStore {
  private readonly _roles = new BehaviorSubject<RoleSelectModel[]>([]);
  readonly roles$ = this._roles.asObservable();
  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();
  private readonly _error = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error.asObservable();

  constructor(private roleService: RoleService) {
    this.loadAll();
  }

  private get roles(): RoleSelectModel[] {
    return this._roles.getValue();
  }

  private set roles(val: RoleSelectModel[]) {
    this._roles.next(val);
  }

  private startLoading(): void {
    this._loading.next(true);
    this._error.next(null);
  }

  loadAll() {
    this.startLoading();

    this.roleService.getAll().pipe(
      tap(data => this.roles = data),
      catchError(err => {
        console.error('Error loading roles', err);
        this._error.next(err?.message ?? 'Error al cargar roles');
        return throwError(() => err);
      }),
      finalize(() => this._loading.next(false))
    ).subscribe();
  }

  create(role: RoleCreateModel): Observable<RoleSelectModel> {
    return this.roleService.create(role).pipe(
      tap(() => {
        this.loadAll(); // Force refresh
      })
    );
  }

  update(updateDto: RoleUpdateModel): Observable<RoleSelectModel> {
    return this.roleService.update(updateDto.id, updateDto).pipe(
      tap(() => {
        this.loadAll(); // Force refresh
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.roleService.delete(id).pipe(
      tap(() => {
        this.roles = this.roles.filter(c => c.id !== id);
      })
    );
  }

  deleteLogic(id: number): Observable<void> {
    return this.roleService.deleteLogic(id).pipe(
      tap(() => {
        this.loadAll(); // Force refresh
      })
    );
  }

  changeActiveStatus(id: number, active: boolean): Observable<IsActive> {
    return this.roleService.changeActiveStatus(id, active).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }
}
