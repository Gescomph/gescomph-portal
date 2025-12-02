export enum AppointmentStatus {
  Pendiente = 1,
  Asignada = 2,
  Aprobada = 3,
  Finalizada = 4,
  Rechazada = 5,
  Vencida = 6,
  Pagada = 7,
  PreJuridico = 8,
  Juridico = 9,
}

export interface AppointmentBaseModel {
  description: string;
  observation?: string | null;
  // Se envía como string sin zona horaria para evitar corrimientos en el backend
  requestDate: Date | string;
  dateTimeAssigned: Date | string | null;
  establishmentId: number;
  active: boolean;
}

export interface AppointmentCreateModel extends AppointmentBaseModel {
  firstName: string;
  lastName: string;
  document: string;
  address: string;
  email: string;
  phone: string;
  cityId: number;
}


export interface AppointmentUpdateModel extends AppointmentBaseModel {
  id: number;
  active: boolean;
}

export interface AppointmentSelect extends AppointmentBaseModel {
  id: number;
  personId: number;
  personName: string;
  establishmentName: string;
  phone: string;
  status: AppointmentStatus;
  statusName: string;
}

export interface AppointmentRejectModel {
  id: number;
  observation?: string | null;
}
