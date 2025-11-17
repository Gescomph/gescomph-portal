import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { combineLatest, EMPTY } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, tap } from 'rxjs/operators';

import { GenericTableComponent } from '../../../../shared/components/feedback/generic-table/generic-table.component';

import {
  RoleFormPermissionCreateModel,
  RoleFormPermissionGroupedModel,
  RoleFormPermissionUpdateModel
} from '../../models/role-form-permission.models';


import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { ToggleButtonComponent } from '../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { TableColumn } from '../../../../shared/models/table-column.models';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { FormStore } from '../../store/form/form.store';
import { PermissionStore } from '../../store/permission/permission.store';
import { RoleFormPermissionStore } from '../../store/role-form-permission/role-form-permission.store';
import { RoleStore } from '../../store/role/role.store';

@Component({
  selector: 'app-role-form-permission',
  templateUrl: './role-form-permission.component.html',
  styleUrls: ['./role-form-permission.component.css'],
  imports: [
    CommonModule,
    GenericTableComponent,
    MatDialogModule,
    ToggleButtonComponent,
    HasRoleAndPermissionDirective
  ]
})
export class RoleFormPermissionComponent implements OnInit, AfterViewInit {
  // Inyección de dependencias
  private readonly roleFormPermissionStore = inject(RoleFormPermissionStore);
  private readonly roleStore = inject(RoleStore);
  private readonly formStore = inject(FormStore);
  private readonly permissionStore = inject(PermissionStore);
  private readonly dialog = inject(MatDialog);
  private readonly sweetAlertService = inject(SweetAlertService);

  // Estado
  items$ = this.roleFormPermissionStore.roleFormPermissions$;
  columns!: TableColumn<RoleFormPermissionGroupedModel>[];

  // Lock por ítem para evitar doble clic y pérdida de feedback
  private busyIds = new Set<number>();
  isBusy = (id: number) => this.busyIds.has(id);

  @ViewChild('permissionsTemplate') permissionsTemplate!: TemplateRef<any>;
  @ViewChild('estadoTemplate') estadoTemplate!: TemplateRef<any>;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.roleStore.loadAll();
    this.formStore.loadAll();
    this.permissionStore.loadAll();
    this.roleFormPermissionStore.loadAll();
  }

  ngAfterViewInit(): void {
    this.columns = [
      { key: 'rolName', header: 'Rol' },
      { key: 'formName', header: 'Formulario' },
      { key: 'permissions', header: 'Permisos', template: this.permissionsTemplate },
      { key: 'active', header: 'Estado', template: this.estadoTemplate }
    ];
    this.cdr.detectChanges();
  }

  // Crear
  onCreateNew(): void {
    combineLatest([this.roleStore.roles$, this.formStore.forms$, this.permissionStore.permissions$])
      .pipe(take(1))
      .subscribe(([roles, forms, permissions]) => {
        import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
          const dialogRef = this.dialog.open(m.FormDialogComponent, {
            width: '600px',
            data: {
              entity: { active: true },
              formType: 'RolFormPermission',
              title: 'Nueva Asignación de Permisos',
              selectOptions: {
                rolId: roles.map(r => ({ value: r.id, label: r.name })),
                formId: forms.map(f => ({ value: f.id, label: f.name })),
                permissionIds: permissions.map(p => ({ value: p.id, label: p.name }))
              }
            },
            disableClose: true,
          });

          dialogRef.afterClosed().pipe(
            filter(Boolean),
            map((result: any) => ({
              rolId: +result.rolId,
              formId: +result.formId,
              permissionIds: result.permissionIds
            }) as RoleFormPermissionCreateModel),
            switchMap(payload =>
              this.roleFormPermissionStore.create(payload).pipe(
                tap(() => this.sweetAlertService.showNotification('Creado', 'Relación creada con éxito.', 'success')),
                catchError(err => {
                  console.error('Error creando:', err);
                  this.sweetAlertService.showApiError(err, 'No se pudo crear.');
                  return EMPTY;
                })
              )
            )
          ).subscribe();
        });
      });
  }

  // Editar
  onEdit(row: RoleFormPermissionGroupedModel): void {
    combineLatest([this.roleStore.roles$, this.formStore.forms$, this.permissionStore.permissions$])
      .pipe(take(1))
      .subscribe(([roles, forms, permissions]) => {
        const entityForDialog = {
          rolId: row.rolId,
          formId: row.formId,
          active: row.active,
          permissionIds: row.permissions.map(p => p.permissionId)
        };

        import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
          const dialogRef = this.dialog.open(m.FormDialogComponent, {
            width: '600px',
            data: {
              entity: entityForDialog,
              formType: 'RolFormPermission',
              title: 'Editar Asignación de Permisos',
              selectOptions: {
                rolId: roles.map(r => ({ value: r.id, label: r.name })),
                formId: forms.map(f => ({ value: f.id, label: f.name })),
                permissionIds: permissions.map(p => ({ value: p.id, label: p.name }))
              }
            },
            disableClose: true,
          });

          dialogRef.afterClosed().pipe(
            filter(Boolean),
            map((result: any) => ({
              id: row.id, // si tu backend usa clave compuesta, cambia a método por grupo
              rolId: +result.rolId,
              formId: +result.formId,
              permissionIds: result.permissionIds,
              active: result.active
            }) as RoleFormPermissionUpdateModel),
            switchMap(payload =>
              this.roleFormPermissionStore.update(payload).pipe(
                tap(() => this.sweetAlertService.showNotification('Actualizado', 'Relación actualizada con éxito.', 'success')),
                catchError(err => {
                  console.error('Error actualizando:', err);
                  this.sweetAlertService.showApiError(err, 'No se pudo actualizar.');
                  return EMPTY;
                })
              )
            )
          ).subscribe();
        });
      });
  }

  // Eliminar (grupo)
  async onDelete(row: RoleFormPermissionGroupedModel): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      'Eliminar Grupo de Permisos',
      `¿Eliminar todos los permisos del rol "${row.rolName}" para el formulario "${row.formName}"?`,
      'Eliminar',
      'Cancelar',
      'warning'
    );
    if (!result.isConfirmed) return;

    this.roleFormPermissionStore.deleteByGroup(row.rolId, row.formId).pipe(take(1)).subscribe({
      next: () => this.sweetAlertService.showNotification('Eliminado', 'Grupo de permisos eliminado correctamente.', 'success'),
      error: err => {
        console.error('Error eliminando:', err);
        this.sweetAlertService.showApiError(err, 'No se pudo eliminar el grupo.');
      }
    });
  }

  onView(row: RoleFormPermissionGroupedModel): void {
  }

  // Toggle activo/inactivo (UI optimista + rollback)
  onToggleActive(row: RoleFormPermissionGroupedModel, e: boolean | { checked: boolean }): void {
    if (this.isBusy(row.id)) return;

    const checked = typeof e === 'boolean' ? e : !!e?.checked;
    const previous = row.active;

    // Optimistic UI + lock por ítem
    this.busyIds.add(row.id);
    row.active = checked;

    this.roleFormPermissionStore.changeActiveStatus(row.id, checked).pipe(
      take(1),
      tap(updated => {
        // Si la API devuelve 204, updated puede venir undefined
        row.active = updated?.active ?? checked;
        this.sweetAlertService.showNotification(
          'Éxito',
          `Permisos del grupo ${row.active ? 'activados' : 'desactivados'} correctamente.`,
          'success'
        );
      }),
      catchError(err => {
        console.error('Error cambiando estado:', err);
        row.active = previous; // revertir
        this.sweetAlertService.showApiError(err, 'No se pudo cambiar el estado.');
        return EMPTY;
      }),
      finalize(() => this.busyIds.delete(row.id))
    ).subscribe();
  }
}
