export const DASHBOARD_TOUR: any = [
  { element: '#dashboard-hero', popover: { title: 'Panel', description: 'Resumen general y accesos rápidos del tablero.', side: 'bottom' as const } },
  { element: '#card-locales-registrados', popover: { title: 'Locales registrados', description: 'Total de locales en gestión.', side: 'top' as const } },
  { element: '#card-locales-ocupados', popover: { title: 'Locales ocupados', description: 'Locales actualmente con contrato activo.', side: 'top' as const } },
  { element: '#card-locales-disponibles', popover: { title: 'Locales disponibles', description: 'Locales listos para nuevos contratos.', side: 'top' as const } },
  { element: '#card-contratos-activos', popover: { title: 'Contratos activos', description: 'Contratos vigentes actualmente.', side: 'top' as const } },
  { element: '#quick-action', popover: { title: 'Acciones rápidas', description: 'Accesos directos para gestionar contratos y establecimientos.', side: 'left' as const } },
  { element: '#upcoming-appointments', popover: { title: 'Próximas citas', description: 'Lista breve de las citas próximas a atender.', side: 'left' as const } },
  { element: '#upcoming-appointments-list', popover: { title: 'Detalle citas', description: 'Se muestran hasta las 3 próximas citas.', side: 'top' as const } },
  { element: '#expiring-contracts', popover: { title: 'Contratos por vencer', description: 'Contratos que vencerán en los próximos 60 días.', side: 'left' as const } },
  { element: '#expiring-contracts-list', popover: { title: 'Lista de vencimientos', description: 'Prioriza las renovaciones urgentes.', side: 'top' as const } },
  { element: '#income-line-chart', popover: { title: 'Tendencia de ingresos', description: 'Gráfica de ingresos en los últimos 6 meses.', side: 'left' as const } },
  { element: '#latest-income', popover: { title: 'Último mes', description: 'Ingreso estimado del mes más reciente.', side: 'top' as const } },
  { element: '#six-month-income', popover: { title: 'Total 6 meses', description: 'Suma de ingresos de los últimos 6 meses.', side: 'top' as const } },
];

