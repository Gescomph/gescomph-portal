import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppointmentSelect, AppointmentStatus } from '../../models/appointment.models';

export type AppointmentDecisionAction = 'accept' | 'reject';
export interface AppointmentDecisionResult {
  action: AppointmentDecisionAction;
  observation?: string | null;
}

@Component({
  selector: 'app-appointment-decision-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './appointment-decision-dialog.component.html',
  styleUrls: ['./appointment-decision-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDecisionDialogComponent {

  observationControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.maxLength(300)]
  });

  readonly AppointmentStatus = AppointmentStatus;

  constructor(
    private readonly dialogRef: MatDialogRef<AppointmentDecisionDialogComponent, AppointmentDecisionResult>,
    @Inject(MAT_DIALOG_DATA) public data: { appointment: AppointmentSelect; action: AppointmentDecisionAction },
  ) { }

  get appointment(): AppointmentSelect {
    return this.data.appointment;
  }

  get action(): AppointmentDecisionAction {
    return this.data.action;
  }

  get isReject(): boolean {
    return this.action === 'reject';
  }

  get canManage(): boolean {
    return this.appointment.status === AppointmentStatus.Pendiente;
  }

  confirm(): void {
    const observation = this.isReject ? this.observationControl.value.trim() : null;
    this.dialogRef.close({
      action: this.action,
      observation: observation || null
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
