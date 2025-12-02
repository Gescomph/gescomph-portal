import { TourStep } from "../../../../shared/models/driver";

export const SECURITY_MODULES_TOUR: TourStep[] = [
  {
    element: '#security-modules-table',
    popover: {
      title: 'Gestión de Módulos',
      description: 'Vista principal para administrar todos los módulos del sistema.',
      side: 'bottom'
    }
  }
];
