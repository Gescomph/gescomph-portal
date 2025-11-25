import { TourStep } from "../../../../shared/models/driver";

export const ESTABLISHMENTS_TOUR: TourStep[] = [
  {
    element: '#establishments-tabs',
    popover: {
      title: 'Gestión de Establecimientos',
      description: 'Vista principal para administrar plazas y establecimientos del sistema.',
      side: 'bottom'
    }
  },
  {
    element: '#squares-search',
    popover: {
      title: 'Buscar Plazas',
      description: 'Filtra plazas por nombre o descripción.',
      side: 'top'
    }
  },
  {
    element: '#squares-new-btn',
    popover: {
      title: 'Nueva Plaza',
      description: 'Crea una nueva plaza en el sistema.',
      side: 'left'
    }
  },
  {
    element: '#squares-cards',
    popover: {
      title: 'Lista de Plazas',
      description: 'Visualiza todas las plazas en tarjetas. Haz clic en una plaza para ver sus establecimientos.',
      side: 'top'
    }
  },
    // Plaza cards
  {
    element: '.plaza-card .card-content h3',
    popover: {
      title: 'Nombre de la Plaza',
      description: 'Cada tarjeta muestra el nombre de la plaza.',
      side: 'right'
    }
  },
  {
    element: '.plaza-card .card-toggle',
    popover: {
      title: 'Estado de la Plaza',
      description: 'Activa o desactiva la plaza usando el interruptor.',
      side: 'left'
    }
  },
  {
    element: '.plaza-card .card-actions .edit-btn',
    popover: {
      title: 'Editar Plaza',
      description: 'Modifica la información de la plaza.',
      side: 'top'
    }
  },
  {
    element: '.plaza-card .card-actions .delete-btn',
    popover: {
      title: 'Eliminar Plaza',
      description: 'Elimina la plaza del sistema.',
      side: 'top'
    }
  },
  {
    element: '#squares-paginator',
    popover: {
      title: 'Paginación',
      description: 'Navega entre páginas de plazas.',
      side: 'top'
    }
  },
  {
    element: '#establishments-plaza-select',
    popover: {
      title: 'Selector de Plaza',
      description: 'Filtra establecimientos por plaza específica.',
      side: 'bottom'
    }
  },
  {
    element: '#establishments-search',
    popover: {
      title: 'Buscar Establecimientos',
      description: 'Filtra establecimientos por nombre, dirección o descripción.',
      side: 'top'
    }
  },
  {
    element: '#establishments-new-btn',
    popover: {
      title: 'Nuevo Establecimiento',
      description: 'Crea un nuevo establecimiento en el sistema.',
      side: 'left'
    }
  },
  {
    element: '#establishments-cards',
    popover: {
      title: 'Lista de Establecimientos',
      description: 'Visualiza todos los establecimientos en tarjetas con información detallada.',
      side: 'top'
    }
  },

  // Establishment cards
  {
    element: '.establishment-card .card-content h3',
    popover: {
      title: 'Nombre del Establecimiento',
      description: 'Cada tarjeta muestra el nombre del establecimiento.',
      side: 'right'
    }
  },
  {
    element: '.establishment-card .info-grid',
    popover: {
      title: 'Información del Establecimiento',
      description: 'Dirección, ubicación y área del local.',
      side: 'right'
    }
  },
  {
    element: '.establishment-card .card-price',
    popover: {
      title: 'Precio de Alquiler',
      description: 'Valor base del alquiler del establecimiento.',
      side: 'left'
    }
  },
  {
    element: '.establishment-card .card-actions .view-btn',
    popover: {
      title: 'Ver Detalles',
      description: 'Haz clic para ver información completa del establecimiento.',
      side: 'top'
    }
  },
  {
    element: '.establishment-card .card-actions .edit-btn',
    popover: {
      title: 'Editar Establecimiento',
      description: 'Modifica la información del establecimiento.',
      side: 'top'
    }
  },
  {
    element: '.establishment-card .card-actions .delete-btn',
    popover: {
      title: 'Eliminar Establecimiento',
      description: 'Elimina el establecimiento del sistema.',
      side: 'top'
    }
  },
  {
    element: '#establishments-paginator',
    popover: {
      title: 'Paginación',
      description: 'Navega entre páginas de establecimientos.',
      side: 'top'
    }
  }
];
