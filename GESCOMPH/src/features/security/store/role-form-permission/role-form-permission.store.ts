import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RoleFormPermissionCreateModel, RoleFormPermissionGroupedModel, RoleFormPermissionUpdateModel } from '../../models/role-form-permission.models';
import { RoleFormPermissionService } from '../../services/role-form-permission/role-form-permission.service';

@Injectable({
  providedIn: 'root'
})
export class RoleFormPermissionStore {
  // El estado ahora guarda el modelo agrupado
  private readonly _roleFormPermissions = new BehaviorSubject<RoleFormPermissionGroupedModel[]>([]);
  readonly roleFormPermissions$ = this._roleFormPermissions.asObservable();

  constructor(private roleFormPermissionService: RoleFormPermissionService) {
    this.loadAll();
  }

  private get roleFormPermissions(): RoleFormPermissionGroupedModel[] {
    return this._roleFormPermissions.getValue();
  }

  private set roleFormPermissions(val: RoleFormPermissionGroupedModel[]) {
    this._roleFormPermissions.next(val);
  }

  // Carga inicial (usa el método agrupado del servicio)
  loadAll() {
    this.roleFormPermissionService.getAll().pipe(
      tap(data => this.roleFormPermissions = data),
      catchError(err => {
        console.error('Error loading grouped rolFormPermissions', err);
        return throwError(() => err);
      })
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
        // Después de borrar, recargamos la lista para reflejar los cambios
        this.loadAll();
      })
    );
  }

  // Eliminar individual: también refresca la lista
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
