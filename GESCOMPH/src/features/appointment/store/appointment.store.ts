// angular 17+
import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppointmentService } from '../services/appointment/appointment.service';
import { AppointmentSelect, AppointmentCreateModel, AppointmentUpdateModel } from '../models/appointment.models';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentStore {

  private readonly service = inject(AppointmentService);

  // STATE
  readonly appointments = signal<AppointmentSelect[]>([]);

  // ACTIONS
  loadAll() {
    return this.service.getAll().pipe(
      tap(data => this.appointments.set(data))
    );
  }

  loadById(id: number) {
    return this.appointments().find(c => c.id === id);
  }

  create(dto: AppointmentCreateModel) {
    return this.service.create(dto).pipe(
      tap(() => this.loadAll().subscribe())
    );
  }

  update(id: number, dto: AppointmentUpdateModel) {
    return this.service.update(id, dto).pipe(
      tap(() => this.loadAll().subscribe())
    );
  }

  delete(id: number) {
    return this.service.delete(id).pipe(
      tap(() => this.appointments.update(arr => arr.filter(c => c.id !== id)))
    );
  }

  deleteLogic(id: number) {
    return this.service.deleteLogic(id).pipe(
      tap(() => this.loadAll().subscribe())
    );
  }

  changeActiveStatus(id: number, active: boolean) {
    return this.service.changeActiveStatus(id, active).pipe(
      tap(() => this.loadAll().subscribe())
    );
  }
}
