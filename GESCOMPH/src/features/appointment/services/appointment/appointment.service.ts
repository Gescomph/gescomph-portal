import { Injectable } from '@angular/core';
import { GenericService } from '../../../../core/services/generic/generic.service';
import { AppointmentCreateModel, AppointmentRejectModel, AppointmentSelect, AppointmentStatus, AppointmentUpdateModel } from '../../models/appointment.models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService extends GenericService<AppointmentSelect, AppointmentCreateModel, AppointmentUpdateModel> {
  protected override resource = 'appointment';

  getByDate(date: string) {
    // El endpoint real es GET api/Appointment/GetByDate?date=yyyy-MM-dd
    return this.http.get<AppointmentSelect[]>(this.url('GetByDate'), { params: { date } });
  }

  updateStatus(id: number, status: AppointmentStatus, observation?: string | null) {
    const body = { id, status, observation: observation ?? null };
    return this.http.post<AppointmentSelect>(this.url(id, 'status'), body);
  }

  accept(id: number) {
    return this.updateStatus(id, AppointmentStatus.Aprobada, null);
  }

  reject(id: number, observation?: string | null) {
    return this.updateStatus(id, AppointmentStatus.Rechazada, observation ?? null);
  }

}
