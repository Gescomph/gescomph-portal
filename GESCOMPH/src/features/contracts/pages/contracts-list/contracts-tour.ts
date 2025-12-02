import { TourStep } from "../../../../shared/models/driver";

export const CONTRACTS_TOUR: TourStep[] = [
  {
    element: '#contracts-header',
    popover: {
      title: 'Gestión de Contratos',
      description: 'Vista principal para administrar todos los contratos del sistema.',
      side: 'bottom'
    }
  },
  {
    element: '#contracts-clauses-btn',
    popover: {
      title: 'Catálogo de Cláusulas',
      description: 'Accede al catálogo de cláusulas predefinidas para contratos.',
      side: 'bottom'
    }
  },
  {
    element: '#contracts-search',
    popover: {
      title: 'Buscar Contratos',
      description: 'Filtra contratos por nombre, documento, teléfono o email.',
      side: 'top'
    }
  },
  {
    element: '#contracts-new-btn',
    popover: {
      title: 'Nuevo Contrato',
      description: 'Crea un nuevo contrato desde cero.',
      side: 'left'
    }
  },
  {
    element: '#contracts-stats',
    popover: {
      title: 'Estadísticas',
      description: 'Métricas rápidas: total de contratos, activos e inactivos.',
      side: 'top'
    }
  },
  {
    element: '#contracts-grid',
    popover: {
      title: 'Lista de Contratos',
      description: 'Visualiza todos los contratos en tarjetas con información detallada.',
      side: 'top'
    }
  },
  {
    element: '.contract-card .card-header h3',
    popover: {
      title: 'Nombre del Contratante',
      description: 'Nombre completo de la persona o empresa con el contrato.',
      side: 'right'
    }
  },
  {
    element: '.contract-card .chip',
    popover: {
      title: 'Estado del Contrato',
      description: 'Indica si el contrato está activo o inactivo.',
      side: 'bottom'
    }
  },
  {
    element: '.contract-card .card-body .meta-grid',
    popover: {
      title: 'Información del Contrato',
      description: 'Documento, teléfono, email y período de vigencia.',
      side: 'right'
    }
  },
  {
    element: '.contract-card .amounts',
    popover: {
      title: 'Valores del Contrato',
      description: 'Monto total base y cantidad en UVT acordada.',
      side: 'left'
    }
  },
  {
    element: '[id^="contract-download-"]',
    popover: {
      title: 'Descargar PDF',
      description: 'Genera y descarga el contrato en formato PDF.',
      side: 'top'
    }
  },
  {
    element: '[id^="contract-view-"]',
    popover: {
      title: 'Ver Detalles',
      description: 'Abre una ventana con información completa del contrato.',
      side: 'top'
    }
  },
  {
    element: '[id^="contract-toggle-"]',
    popover: {
      title: 'Cambiar Estado',
      description: 'Activa o desactiva el contrato.',
      side: 'top'
    }
  },
  {
    element: '#contracts-paginator',
    popover: {
      title: 'Paginación',
      description: 'Navega entre páginas de contratos. Ajusta el tamaño de página según necesites.',
      side: 'top'
    }
  }
];
