import { TourStep } from "../../../../shared/models/driver";

export const SECURITY_PERMISSIONS_TOUR: TourStep[] = [
  {
    element: '#security-permissions-table',
    popover: {
      title: 'Gestión de Permisos',
      description: 'Vista principal para administrar todos los permisos del sistema.',
      side: 'bottom'
    }
  }
];
