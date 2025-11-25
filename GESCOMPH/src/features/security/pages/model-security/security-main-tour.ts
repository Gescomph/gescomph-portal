import { TourStep } from "../../../../shared/models/driver";

export const SECURITY_MAIN_TOUR: TourStep[] = [
  {
    element: '#security-main-tabs',
    popover: {
      title: 'Seguridad del Sistema',
      description: 'Vista principal para gestionar formularios, módulos, roles y permisos.',
      side: 'bottom'
    }
  }
];
