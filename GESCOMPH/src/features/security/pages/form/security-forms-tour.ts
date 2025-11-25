import { TourStep } from "../../../../shared/models/driver";

export const SECURITY_FORMS_TOUR: TourStep[] = [
  {
    element: '#security-forms-table',
    popover: {
      title: 'Gestión de Formularios',
      description: 'Vista principal para administrar todos los formularios del sistema.',
      side: 'bottom'
    }
  }
];
