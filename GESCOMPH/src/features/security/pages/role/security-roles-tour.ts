import { TourStep } from "../../../../shared/models/driver";

export const SECURITY_ROLES_TOUR: TourStep[] = [
  {
    element: '#security-roles-table',
    popover: {
      title: 'Gestión de Roles',
      description: 'Vista principal para administrar todos los roles del sistema.',
      side: 'bottom'
    }
  }
];
