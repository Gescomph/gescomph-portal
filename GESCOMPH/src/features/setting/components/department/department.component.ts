import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { IsActive } from '../../../../core/models/auth/is-active.models';
import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { GenericTableComponent } from '../../../../shared/components/feedback/generic-table/generic-table.component';
import { ToggleButtonComponent } from '../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { TableColumn } from '../../../../shared/models/table-column.models';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { DepartmentSelectModel } from '../../models/department.models';
import { DepartmentStore } from '../../store/department/department.store';

@Component({
  selector: 'app-department',
  imports: [
    CommonModule,
    GenericTableComponent,
    MatButtonModule,
    MatIconModule,
    ToggleButtonComponent,
    HasRoleAndPermissionDirective
  ],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentComponent implements OnInit {
  // Estado básico
  departments$: Observable<DepartmentSelectModel[]> = inject(DepartmentStore).departments$;

  @ViewChild('estadoTemplate', { static: true }) estadoTemplate!: TemplateRef<any>;

  columns: TableColumn<DepartmentSelectModel>[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nombre' }
  ];

  // DI explícita donde sí la usamos
  constructor(
    private readonly store: DepartmentStore,
    private readonly dialog: MatDialog,
    private readonly sweetAlert: SweetAlertService
  ) { }

  ngOnInit(): void {
    this.columns = [
      ...this.columns,
      { key: 'active', header: 'Estado', type: 'custom', template: this.estadoTemplate }
    ];
  }

  openCreateDialog(): void {
    import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.FormDialogComponent, {
        width: '400px',
        data: { entity: {}, formType: 'Department' },
        disableClose: true,
      });

      dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
        if (!result) return;
        this.store.create(result).pipe(take(1)).subscribe({
          next: () => this.sweetAlert.showNotification('Éxito', 'Departamento creado exitosamente', 'success')
        });
      });
    });
  }

  openEditDialog(row: DepartmentSelectModel): void {
    import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.FormDialogComponent, {
        width: '400px',
        data: { entity: row, formType: 'Department' },
        disableClose: true,
      });

      dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
        if (!result) return;
        this.store.update(result).pipe(take(1)).subscribe({
          next: () => this.sweetAlert.showNotification('Éxito', 'Departamento actualizado exitosamente', 'success')
        });
      });
    });
  }

  handleDelete(row: DepartmentSelectModel): void {
    if (!row.id) return;
    this.sweetAlert.showConfirm('¿Está seguro?', 'Esta acción no se puede deshacer').then(res => {
      if (!res.isConfirmed) return;
      this.store.delete(row.id!).pipe(take(1)).subscribe({
        next: () => this.sweetAlert.showNotification('Éxito', 'Departamento eliminado exitosamente', 'success')
      });
    });
  }

  // Toggle activo/inactivo (UI optimista + rollback)
  onToggleActive(row: IsActive, e: boolean | { checked: boolean }) {
    const checked = typeof e === 'boolean' ? e : !!e?.checked;
    const prev = row.active;

    // UI optimista
    row.active = checked;

    this.store.changeActiveStatus(row.id, checked).pipe(take(1)).subscribe({
      next: updated => {
        // Si la API devuelve 204, mantenemos el valor; si devuelve DTO, sincronizamos
        row.active = updated?.active ?? checked;
        this.sweetAlert.showNotification('Éxito',
          `Departamento ${row.active ? 'activado' : 'desactivado'} correctamente.`,
          'success');
      },
      error: err => {
        // Rollback
        row.active = prev;
        this.sweetAlert.showApiError(err, 'No se pudo cambiar el estado.');
      }
    });
  }
}
