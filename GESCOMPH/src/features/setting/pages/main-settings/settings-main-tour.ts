import { TourStep } from "../../../../shared/models/driver";

export const SETTINGS_MAIN_TOUR: TourStep[] = [
  {
    element: '#settings-main-tabs',
    popover: {
      title: 'Configuración del Sistema',
      description: 'Navega entre diferentes secciones de configuración.',
      side: 'bottom'
    }
  },
  // Profile Form - Tab 1
  {
    element: '#profile-first-name',
    popover: {
      title: 'Información Personal',
      description: 'Actualiza tus nombres y apellidos.',
      side: 'top'
    }
  },
  {
    element: '#profile-document',
    popover: {
      title: 'Documento de Identidad',
      description: 'Tu número de cédula (solo lectura).',
      side: 'top'
    }
  },
  {
    element: '#profile-phone',
    popover: {
      title: 'Teléfono de Contacto',
      description: 'Número celular colombiano de 10 dígitos.',
      side: 'top'
    }
  },
  {
    element: '#profile-email',
    popover: {
      title: 'Correo Electrónico',
      description: 'Se usa para acceso al sistema y notificaciones.',
      side: 'top'
    }
  },
  {
    element: '#profile-address',
    popover: {
      title: 'Dirección Residencial',
      description: 'Dirección completa donde resides actualmente.',
      side: 'top'
    }
  },
  {
    element: '#profile-two-factor',
    popover: {
      title: 'Verificación en Dos Pasos',
      description: 'Activa para mayor seguridad en el acceso.',
      side: 'left'
    }
  },
  {
    element: '#profile-department',
    popover: {
      title: 'Departamento',
      description: 'Selecciona el departamento donde resides.',
      side: 'top'
    }
  },
  {
    element: '#profile-city',
    popover: {
      title: 'Ciudad',
      description: 'Selecciona la ciudad de residencia.',
      side: 'top'
    }
  },
  {
    element: '#profile-save-btn',
    popover: {
      title: 'Guardar Cambios',
      description: 'Guarda toda la información actualizada.',
      side: 'top'
    }
  },
  // Change Password - Tab 4
  {
    element: '#password-current',
    popover: {
      title: 'Contraseña Actual',
      description: 'Ingresa tu contraseña actual para verificar identidad.',
      side: 'top'
    }
  },
  {
    element: '#password-new',
    popover: {
      title: 'Nueva Contraseña',
      description: 'Mínimo 8 caracteres con mayúsculas, minúsculas y números.',
      side: 'top'
    }
  },
  {
    element: '#password-confirm',
    popover: {
      title: 'Confirmar Contraseña',
      description: 'Repite la nueva contraseña para confirmar.',
      side: 'top'
    }
  },
  {
    element: '#password-change-btn',
    popover: {
      title: 'Cambiar Contraseña',
      description: 'Aplica el cambio de contraseña.',
      side: 'top'
    }
  },
  // System Parameters - Tab 2
  {
    element: '#system-params-table',
    popover: {
      title: 'Parámetros del Sistema',
      description: 'Variables de configuración que controlan el comportamiento del sistema (tasas, límites, configuraciones globales).',
      side: 'bottom'
    }
  },
  // Location Settings - Tab 3 (Departments and Cities)
  {
    element: '#departments-table',
    popover: {
      title: 'Departamentos',
      description: 'Gestiona los departamentos del país para ubicación geográfica.',
      side: 'bottom'
    }
  },
  {
    element: '#cities-table',
    popover: {
      title: 'Ciudades',
      description: 'Administra las ciudades organizadas por departamento.',
      side: 'bottom'
    }
  }
];
