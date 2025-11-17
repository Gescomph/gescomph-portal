import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, take } from 'rxjs';
import { IsActive } from '../../../../core/models/auth/is-active.models';
import { GenericTableComponent } from "../../../../shared/components/feedback/generic-table/generic-table.component";
import { FormDialogComponent } from '../../../../shared/components/forms/form-dialog/form-dialog.component';
import { ToggleButtonComponent } from '../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { TableColumn } from '../../../../shared/models/table-column.models';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { SystemParameterSelectModel } from '../../models/system-parameter.models';
import { SystemParametersService } from '../../services/system-parameters/system-parameters.service';

@Component({
  selector: 'app-system-parameters',
  imports: [GenericTableComponent, ToggleButtonComponent, CommonModule],
  templateUrl: './system-parameters.component.html',
  styleUrls: ['./system-parameters.component.css']
})
export class SystemParametersComponent {
  systemParameters$!: Observable<SystemParameterSelectModel[]>;

  @ViewChild('estadoTemplate', { static: true }) estadoTemplate!: TemplateRef<any>;

  columns: TableColumn<SystemParameterSelectModel>[] = [
    { key: 'id', header: 'ID' },
    { key: 'key', header: 'Nombre' },
    { key: 'value', header: 'valor' },
    { key: 'effectiveFrom', header: 'Vigente desde', format: (v) => this.formatDateOnly(v) },
    { key: 'effectiveTo', header: 'Vigente hasta', format: (v) => this.formatDateOnly(v) },
  ];

  constructor(
    private systemParametersService: SystemParametersService,
    private dialog: MatDialog,
    private sweetAlertService: SweetAlertService
  ) { }

  ngOnInit(): void {
    this.columns = [
      ...this.columns,
      {
        key: 'active',
        header: 'Estado',
        type: 'custom',
        template: this.estadoTemplate
      }
    ];
    this.loadSystemParameters();
  }

  // Formatea a YYYY-MM-DD (sin hora)
  private formatDateOnly(v: any): string {
    if (!v) return '';
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return String(v);
      return d.toISOString().split('T')[0];
    } catch { return String(v); }
  }

  private loadSystemParameters(): void {
    this.systemParameters$ = this.systemParametersService.getAll();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: '400px',
      data: {
        entity: {},
        formType: 'SystemParameter'
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.systemParametersService.create(result).pipe(take(1)).subscribe({
          next: () => {
            this.sweetAlertService.showNotification('Éxito', 'Parámetro del sistema creado exitosamente', 'success');
            this.loadSystemParameters();
          }
        });
      }
    });
  }

  openEditDialog(row: SystemParameterSelectModel): void {
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: '400px',
      data: {
        entity: row,
        formType: 'SystemParameter'
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.systemParametersService.update(result.id, result).pipe(take(1)).subscribe({
          next: () => {
            this.sweetAlertService.showNotification('Éxito', 'Parámetro del sistema actualizado exitosamente', 'success');
            this.loadSystemParameters();
          }
        });
      }
    });
  }

  handleDelete(row: SystemParameterSelectModel): void {
    if (row.id) {
      this.sweetAlertService.showConfirm('¿Está seguro?', 'Esta acción no se puede deshacer').then(result => {
        if (result.isConfirmed) {
          this.systemParametersService.delete(row.id).pipe(take(1)).subscribe({
            next: () => {
              this.sweetAlertService.showNotification('Éxito', 'Parámetro del sistema eliminado exitosamente', 'success');
              this.loadSystemParameters();
            }
          });
        }
      });
    }
  }


  // Toggle activo/inactivo (UI optimista + rollback)
  onToggleActive(row: IsActive, e: boolean | { checked: boolean }) {
    const checked = typeof e === 'boolean' ? e : !!e?.checked;
    const prev = row.active;

    // UI optimista
    row.active = checked;

        this.systemParametersService.changeActiveStatus(row.id, checked).pipe(take(1)).subscribe({
          next: updated => {
            // Si la API devuelve 204, mantenemos el valor; si devuelve DTO, sincronizamos
            row.active = updated?.active ?? checked;
        this.sweetAlertService.showNotification('Éxito',
          `Parámetro del sistema ${row.active ? 'activado' : 'desactivado'} correctamente.`,
          'success');
        this.loadSystemParameters();
          },
      error: err => {
        // Rollback
        row.active = prev;
        this.sweetAlertService.showApiError(err, 'No se pudo cambiar el estado.');
      }
    });
  }


}
