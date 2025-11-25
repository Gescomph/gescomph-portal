import { TourStep } from "../../../../shared/models/driver";

export const APPOINTMENT_TOUR: TourStep[] = [
  {
    element: '#appointments-table',
    popover: {
      title: 'Gestión de Citas',
      description: 'Vista principal para administrar todas las citas del sistema.',
      side: 'bottom'
    }
  }
];
