// angular 17+
import { inject, Injectable, signal } from '@angular/core';
import { AppointmentService } from '../services/appointment/appointment.service';
import { AppointmentSelect, AppointmentCreateModel, AppointmentUpdateModel, AppointmentStatus } from '../models/appointment.models';
import { map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentStore {

  private readonly service = inject(AppointmentService);

  // STATE
  readonly appointments = signal<AppointmentSelect[]>([]);

  // ACTIONS
  loadAll() {
    return this.service.getAll().pipe(tap(data => this.appointments.set(data.map(this.ensureStatus))));
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

  accept(id: number) {
    return this.service.accept(id).pipe(
      map(a => this.applyStatus(a, AppointmentStatus.Aprobada, 'Aprobada')),
      tap((updated) => this.replaceOne(updated))
    );
  }

  reject(id: number, observation?: string | null) {
    return this.service.reject(id, observation).pipe(
      map(a => this.applyStatus(a, AppointmentStatus.Rechazada, 'Rechazada')),
      tap((updated) => this.replaceOne(updated))
    );
  }

  private replaceOne(appointment: AppointmentSelect) {
    this.appointments.update(list => {
      const idx = list.findIndex(a => a.id === appointment.id);
      if (idx === -1) return [...list, appointment];
      const clone = [...list];
      clone[idx] = appointment;
      return clone;
    });
  }

  private ensureStatus = (a: AppointmentSelect): AppointmentSelect => {
    if (typeof a.status === 'number' && a.statusName) return a;
    const status = a.status ?? AppointmentStatus.Pendiente;
    const statusName = a.statusName ?? 'Pendiente';
    return { ...a, status, statusName };
  };

  private applyStatus = (
    a: AppointmentSelect,
    status: AppointmentStatus,
    statusName: string
  ): AppointmentSelect => {
    // Si el backend no devuelve estado, forzamos el que corresponde a la acción
    const normalized = this.ensureStatus(a);
    return { ...normalized, status, statusName };
  };
}
