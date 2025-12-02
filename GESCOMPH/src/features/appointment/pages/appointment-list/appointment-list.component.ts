import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, EMPTY, filter, finalize, switchMap, take, tap } from 'rxjs';
import { GenericTableComponent } from '../../../../shared/components/feedback/generic-table/generic-table.component';
import { FormDialogComponent } from '../../../../shared/components/forms/form-dialog/form-dialog.component';
import { TableColumn } from '../../../../shared/models/table-column.models';
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { AppointmentSelect, AppointmentStatus, AppointmentUpdateModel } from '../../models/appointment.models';
import { AppointmentDecisionDialogComponent, AppointmentDecisionResult } from '../../components/appointment-decision-dialog/appointment-decision-dialog.component';
import { AppointmentStore } from '../../store/appointment.store';
import { APPOINTMENT_TOUR } from './appointment-tour';
import { DriverJsService } from '../../../../shared/services/driver/driver-js.services';

@Component({
  selector: 'app-appointment-list',
  imports: [CommonModule, GenericTableComponent, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatTooltipModule],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css',
})
export class AppointmentListComponent implements OnInit {

  private readonly appointmentStore = inject(AppointmentStore);
  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly pageHeaderService = inject(PageHeaderService);
  private readonly driverJs = inject(DriverJsService);

  appointments = this.appointmentStore.appointments;

  pendingId: number | null = null;
  pendingAction: 'accept' | 'reject' | null = null;

  columns: TableColumn<AppointmentSelect>[] = [];

  readonly AppointmentStatusEnum = AppointmentStatus;

  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('userTemplate', { static: true }) userTemplate!: TemplateRef<any>;
  @ViewChild('onlyDateTpl', { static: true }) onlyDateTpl!: TemplateRef<any>;
  @ViewChild('dateTimeTpl', { static: true }) dateTimeTpl!: TemplateRef<any>;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.pageHeaderService.setPageHeader('Citas', 'Gestión de Citas');
    this.driverJs.registerSteps('appointment', APPOINTMENT_TOUR);

    this.appointmentStore.loadAll().pipe(take(1)).subscribe({
      error: (err) => this.sweetAlertService.showApiError(err, 'No se pudieron cargar las citas.'),
    });

    this.columns = [
      { key: 'personName', header: 'Arrendatario', template: this.userTemplate },
      { key: 'establishmentName', header: 'Local' },
      { key: 'description', header: 'Descripcion' },
      { key: 'requestDate', header: 'Fecha de solicitud', template: this.onlyDateTpl },
      { key: 'dateTimeAssigned', header: 'Fecha de asignacion', template: this.dateTimeTpl },
      { key: 'status', header: 'Estado', template: this.statusTemplate },
      { key: 'actions', header: 'Acciones', template: this.actionsTemplate },
    ];
  }

  onCreateNew(): void {
    import('../../components/form-appointment/form-appointment.component').then(m => {
      const ref = this.dialog.open(m.FormAppointmentComponent, {
        width: '800px',
        disableClose: true,
        autoFocus: true,
        data: null,
      });

      ref.afterClosed().pipe(take(1)).subscribe((created: boolean) => {
        if (!created) return;
        this.sweetAlertService.showNotification('Exito', 'Cita creada correctamente.', 'success');
        this.appointmentStore.loadAll().pipe(take(1)).subscribe();
      });
    });
  }

  onEdit(row: AppointmentUpdateModel): void {
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: '600px',
      data: { entity: row, formType: 'Form' },
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(
      filter((result): result is Partial<AppointmentUpdateModel> => !!result),
      switchMap(result => this.appointmentStore.update(row.id, { ...row, ...result, id: row.id, active: row.active })),
      take(1),
      tap(() => this.sweetAlertService.showNotification('Actualizacion exitosa', 'Cita actualizada correctamente.', 'success')),
      catchError(err => {
        console.error('Error actualizando la cita:', err);
        this.sweetAlertService.showApiError(err, 'No se pudo actualizar la cita.');
        return EMPTY;
      })
    ).subscribe();
  }

  async onDelete(row: AppointmentSelect): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      'Eliminar cita',
      `Deseas eliminar la cita de "${row.personName}"?`,
      'Eliminar',
      'Cancelar',
      'warning'
    );

    if (result.isConfirmed) {
      this.appointmentStore.deleteLogic(row.id).subscribe({
        next: () => this.sweetAlertService.showNotification('Eliminacion exitosa', 'Cita eliminada correctamente.', 'success'),
        error: err => {
          console.error('Error eliminando la cita:', err);
          this.sweetAlertService.showApiError(err, 'No se pudo eliminar la cita.');
        }
      });
    }
  }

  onView(row: AppointmentSelect): void {
    import('../../components/appointment-detail-dialog/appointment-detail-dialog.component').then(m => {
      this.dialog.open(m.AppointmentDetailDialogComponent, {
        width: '900px',
        maxWidth: '95vw',
        data: { id: row.id },
        autoFocus: false,
        disableClose: false,
      });
    });
  }

  onAccept(row: AppointmentSelect): void {
    const dialogRef = this.dialog.open(AppointmentDecisionDialogComponent, {
      width: '520px',
      data: { appointment: row, action: 'accept' }
    });

    dialogRef.afterClosed().pipe(
      take(1),
      filter((result): result is AppointmentDecisionResult => !!result),
      tap(() => this.setPending(row.id, 'accept')),
      switchMap(() => this.appointmentStore.accept(row.id)),
      tap(() => this.sweetAlertService.showNotification('Cita aprobada', 'La cita fue aprobada correctamente.', 'success')),
      catchError(err => {
        this.sweetAlertService.showApiError(err, 'No se pudo aprobar la cita.');
        return EMPTY;
      }),
      finalize(() => this.clearPending())
    ).subscribe();
  }

  onReject(row: AppointmentSelect): void {
    const dialogRef = this.dialog.open(AppointmentDecisionDialogComponent, {
      width: '520px',
      data: { appointment: row, action: 'reject' }
    });

    dialogRef.afterClosed().pipe(
      take(1),
      filter((result): result is AppointmentDecisionResult => !!result),
      tap(() => this.setPending(row.id, 'reject')),
      switchMap((result) => this.appointmentStore.reject(row.id, result.observation ?? null)),
      tap(() => this.sweetAlertService.showNotification('Cita rechazada', 'La cita fue rechazada.', 'success')),
      catchError(err => {
        this.sweetAlertService.showApiError(err, 'No se pudo rechazar la cita.');
        return EMPTY;
      }),
      finalize(() => this.clearPending())
    ).subscribe();
  }

  isProcessing(rowId: number, action: 'accept' | 'reject'): boolean {
    return this.pendingId === rowId && this.pendingAction === action;
  }

  private setPending(rowId: number, action: 'accept' | 'reject'): void {
    this.pendingId = rowId;
    this.pendingAction = action;
  }

  private clearPending(): void {
    this.pendingId = null;
    this.pendingAction = null;
  }
}
