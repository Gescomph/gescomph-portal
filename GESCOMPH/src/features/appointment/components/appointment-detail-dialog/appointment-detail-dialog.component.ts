import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, take } from 'rxjs/operators';

import { StandardButtonComponent } from '../../../../shared/components/ui/standard-button/standard-button.component';
import { AppointmentSelect, AppointmentStatus } from '../../models/appointment.models';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AppointmentStore } from '../../store/appointment.store';

@Component({
  selector: 'app-appointment-detail-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    StandardButtonComponent,
  ],
  templateUrl: './appointment-detail-dialog.component.html',
  styleUrls: ['./appointment-detail-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailDialogComponent implements OnInit {
  // Inyección
  private readonly store = inject(AppointmentStore);
  private readonly svc = inject(AppointmentService);

  // Estado local
  appointment: AppointmentSelect | null = null;
  loading = false;
  error: string | null = null;

  readonly AppointmentStatusEnum = AppointmentStatus;

  constructor(
    private readonly dialogRef: MatDialogRef<AppointmentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    const id = this.data?.id;
    if (!id) {
      this.error = 'ID de cita no proporcionado';
      this.loading = false;
      return;
    }

    // 1) Intento rápido desde el Store (memoria)
    const fromStore = this.store.loadById(id);
    if (fromStore) {
      this.appointment = fromStore;
      this.loading = false;
      return;
    }

    // 2) Fallback al servicio (asegúrate de exponer getById en AppointmentService)
    this.svc.getById(id)
      .pipe(finalize(() => (this.loading = false)), take(1))
      .subscribe({
        next: (appointment) => {
          // Re-sincroniza con estado actual del Store si aplica
          const current = this.store.loadById(appointment.id);
          this.appointment = current ?? appointment;
        },
        error: (err) => {
          console.error('Error loading appointment detail:', err);
          this.error = 'No se pudo cargar el detalle de la cita.';
        },
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
