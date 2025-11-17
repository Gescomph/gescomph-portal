import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { RoleFormPermissionCreateModel, RoleFormPermissionGroupedModel, RoleFormPermissionUpdateModel } from '../../models/role-form-permission.models';
import { RoleFormPermissionService } from '../../services/role-form-permission/role-form-permission.service';

@Injectable({
  providedIn: 'root'
})
export class RoleFormPermissionStore {
  // El estado ahora guarda el modelo agrupado
  private readonly _roleFormPermissions = new BehaviorSubject<RoleFormPermissionGroupedModel[]>([]);
  readonly roleFormPermissions$ = this._roleFormPermissions.asObservable();
  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();
  private readonly _error = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error.asObservable();

  constructor(private roleFormPermissionService: RoleFormPermissionService) {
    this.loadAll();
  }

  private get roleFormPermissions(): RoleFormPermissionGroupedModel[] {
    return this._roleFormPermissions.getValue();
  }

  private set roleFormPermissions(val: RoleFormPermissionGroupedModel[]) {
    this._roleFormPermissions.next(val);
  }

  private startLoading(): void {
    this._loading.next(true);
    this._error.next(null);
  }

  // Carga inicial (usa el m�todo agrupado del servicio)
  loadAll() {
    this.startLoading();

    this.roleFormPermissionService.getAll().pipe(
      tap(data => this.roleFormPermissions = data),
      catchError(err => {
        console.error('Error loading grouped rolFormPermissions', err);
        this._error.next(err?.message ?? 'Error al cargar permisos agrupados');
        return throwError(() => err);
      }),
      finalize(() => this._loading.next(false))
    ).subscribe();
  }

  // Crear/actualizar: refresca la lista agrupada
  create(rolFormPermission: RoleFormPermissionCreateModel): Observable<RoleFormPermissionGroupedModel> {
    return this.roleFormPermissionService.create(rolFormPermission).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }

  update(updateDto: RoleFormPermissionUpdateModel): Observable<RoleFormPermissionGroupedModel> {
    return this.roleFormPermissionService.update(updateDto.id, updateDto).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }

  // Eliminar por grupo
  deleteByGroup(rolId: number, formId: number): Observable<void> {
    return this.roleFormPermissionService.deleteByGroup(rolId, formId).pipe(
      tap(() => {
        // Despu�s de borrar, recargamos la lista para reflejar los cambios
        this.loadAll();
      })
    );
  }

  // Eliminar individual: tambi�n refresca la lista
  delete(id: number): Observable<void> {
    return this.roleFormPermissionService.delete(id).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }

  deleteLogic(id: number): Observable<void> {
    return this.roleFormPermissionService.deleteLogic(id).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }

  changeActiveStatus(id: number, active: boolean): Observable<RoleFormPermissionGroupedModel> {
    return this.roleFormPermissionService.changeActiveStatus(id, active).pipe(
      tap(() => {
        this.loadAll()
      })
    );
  }
}
