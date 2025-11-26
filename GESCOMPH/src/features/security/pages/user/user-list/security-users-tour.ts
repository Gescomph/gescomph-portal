import { TourStep } from "../../../../../shared/models/driver";

export const SECURITY_USERS_TOUR: TourStep[] = [
  {
    element: '#security-users-table',
    popover: {
      title: 'Gestión de Usuarios',
      description: 'Vista principal para administrar todos los usuarios del sistema.',
      side: 'bottom'
    }
  }
];
