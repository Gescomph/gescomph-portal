import { TourStep } from "../../../../../shared/models/driver";

export const DASHBOARD_TOUR: TourStep[] = [
  {
    element: '#dashboard-hero',
    popover: {
      title: 'Panel',
      description: 'Resumen general y accesos rápidos del tablero.',
      side: 'bottom'
    }
  },
  {
    element: '#card-locales-registrados',
    popover:
    {
      title: 'Locales registrados',
      description: 'Total de locales en gestión.',
      side: 'top'
    }
  },
  {
    element: '#card-locales-ocupados',
    popover: {
      title: 'Locales ocupados',
      description: 'Locales actualmente con contrato activo.',
      side: 'top'
    }
  },
  {
    element:
    '#card-locales-disponibles',
    popover: {
      title: 'Locales disponibles',
      description: 'Locales listos para nuevos contratos.',
      side: 'top'
    }
  },
  {
    element: '#card-contratos-activos',
    popover: {
      title: 'Contratos activos',
      description: 'Contratos vigentes actualmente.',
      side: 'top'
    }
  },
  {
    element: '#quick-action',
    popover: {
      title: 'Acciones rápidas',
      description: 'Accesos directos para gestionar contratos y establecimientos.',
      side: 'left'
    }
  },
  {
    element: '#upcoming-appointments',
    popover: {
      title: 'Próximas citas',
      description: 'Lista breve de las citas próximas a atender.',
      side: 'left'
    }
  },
  {
    element: '#upcoming-appointments-list',
    popover: {
      title: 'Detalle citas',
      description: 'Se muestran hasta las 3 próximas citas.',
      side: 'top'
    }
  },
  {
    element: '#expiring-contracts',
    popover: {
      title: 'Contratos por vencer',
      description: 'Contratos que vencerán en los próximos 60 días.',
      side: 'left'
    }
  },
  {
    element: '#expiring-contracts-list',
    popover: {
      title: 'Lista de vencimientos',
      description: 'Prioriza las renovaciones urgentes.',
      side: 'top'
    }
  },
  {
    element: '#income-line-chart',
    popover: {
      title: 'Tendencia de ingresos',
      description: 'Gráfica de ingresos en los últimos 6 meses.',
      side: 'left'
    }
  },
  {
    element: '#latest-income',
    popover: {
      title: 'Último mes',
      description: 'Ingreso estimado del mes más reciente.',
      side: 'top'
    }
  },
  {
    element: '#six-month-income',
    popover: {
      title: 'Total 6 meses',
      description: 'Suma de ingresos de los últimos 6 meses.',
      side: 'top'
    }
  },
];

