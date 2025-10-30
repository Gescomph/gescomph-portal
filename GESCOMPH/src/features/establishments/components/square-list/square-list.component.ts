import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, effect, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GenericTableComponent } from '../../../../shared/components/feedback/generic-table/generic-table.component';
import { ToggleButtonComponent } from '../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { TableColumn } from '../../../../shared/models/table-column.models';

import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { SquareSelectModel, SquareUpdateModel } from '../../models/squares.models';
import { SquareStore } from '../../store/square/square.store';
import { EstablishmentEventsService } from '../../services/shared/establishment-events.service';

@Component({
  selector: 'app-square-list',
  imports: [GenericTableComponent, CommonModule, ToggleButtonComponent, HasRoleAndPermissionDirective, MatProgressSpinnerModule],
  templateUrl: './square-list.component.html',
  styleUrl: './square-list.component.css'
})
export class SquareListComponent implements OnInit {
  private readonly squaresStore = inject(SquareStore);
  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly sharedEvents = inject(EstablishmentEventsService);
  private readonly dialog = inject(MatDialog);

  readonly squares = this.squaresStore.items;
  readonly loading = this.squaresStore.loading;
  readonly error = this.squaresStore.error;

  selectedSquare: SquareSelectModel | null = null;
  columns: TableColumn<SquareSelectModel>[] = [];

  @ViewChild('estadoTemplate', { static: true }) estadoTemplate!: TemplateRef<any>;

  async ngOnInit(): Promise<void> {
    this.columns = [
      { key: 'name', header: 'Nombre' },
      { key: 'description', header: 'Descripción' },
      { key: 'location', header: 'Ubicación' },
      { key: 'active', header: 'Estado', type: 'custom', template: this.estadoTemplate }
    ];

    await this.squaresStore.loadAll();
  }

  // Notificación de error estandarizada
  private readonly errorToast = effect(() => {
    const err = this.error();
    if (err) {
      this.sweetAlertService.showApiError(err, 'No se pudieron cargar las plazas.');
    }
  });

  onView(row: SquareSelectModel) { }

  onCreate(): void {
    import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
      const ref = this.dialog.open(m.FormDialogComponent, {
        width: '600px',
        data: { entity: {}, formType: 'Plaza' }
      });

      ref.afterClosed().subscribe(async result => {
        if (!result) return;
        try {
          await this.squaresStore.create(result);
          this.sweetAlertService.showNotification('Creación Exitosa', 'Plaza creada exitosamente.', 'success');
        } catch (err) {
          this.sweetAlertService.showApiError(err, 'No se pudo crear la plaza.');
        }
      });
    });
  }

  onEdit(row: SquareUpdateModel): void {
    import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
      const ref = this.dialog.open(m.FormDialogComponent, {
        width: '600px',
        data: { entity: row, formType: 'Plaza' }
      });

      ref.afterClosed().subscribe(async (partial: Partial<SquareUpdateModel> | undefined) => {
        if (!partial) return;
        const dto: SquareUpdateModel = { ...row, ...partial, id: row.id };
        try {
          await this.squaresStore.update(dto.id, dto);
          this.sweetAlertService.showNotification('Actualización Exitosa', 'Plaza actualizada exitosamente.', 'success');
        } catch (err) {
          this.sweetAlertService.showApiError(err, 'No se pudo actualizar la plaza.');
        }
      });
    });
  }

  async onDelete(row: SquareSelectModel): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      'Eliminar plaza',
      `¿Deseas eliminar la plaza "${row.name}"?`,
      'Eliminar',
      'Cancelar',
      'warning'
    );
    if (!result.isConfirmed) return;
    try {
      await this.squaresStore.deleteLogic(row.id);
      this.sweetAlertService.showNotification('Eliminación exitosa', 'Plaza eliminada correctamente.', 'success');
    } catch (err) {
      this.sweetAlertService.showApiError(err, 'No se pudo eliminar la plaza.');
    }
  }

  async onToggleActive(
    id: number | null | undefined,
    e: { checked: boolean } | boolean | null | undefined
  ): Promise<void> {
    if (id == null) {
      this.sweetAlertService.showNotification('Sin plaza', 'No se pudo obtener el ID de la plaza.', 'warning');
      return;
    }
    const checked = typeof e === 'boolean' ? e : !!e?.checked;
    try {
      const res = await this.squaresStore.changeActiveStatusRemote(id, checked);
      if (!res?.ok) {
        const msg = res?.message || 'No se pudo cambiar el estado de la plaza.';
        this.sweetAlertService.showNotification('Operación no permitida', msg, 'warning');
        return;
      }
      this.sharedEvents.notifyPlazaStateChanged(id);
      this.sweetAlertService.showNotification('Éxito', `Plaza ${checked ? 'activada' : 'desactivada'} correctamente.`, 'success');
    } catch (err: any) {
      const detail = err?.error?.detail || err?.error?.message || err?.error?.title || err?.message;
      const msg = detail || 'No se pudo cambiar el estado de la plaza.';
      this.sweetAlertService.showNotification('Operación no permitida', msg, 'warning');
    }
  }

  trackById = (_: number, item: SquareSelectModel) => item.id;

  isBusy(id: number | null | undefined): boolean {
    return typeof id === 'number' ? this.squaresStore.isBusy(id) : false;
  }
}
