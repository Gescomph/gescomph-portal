import { TourStep } from "../../../../shared/models/driver";

export const CLAUSES_TOUR: TourStep[] = [
  {
    element: "#clauses-page",
    popover: {
      title: "Bienvenido al módulo de Cláusulas",
      description: "Aquí podrás gestionar todas las cláusulas disponibles para asociar a los contratos.",
      side: "center"
    }
  },

  {
    element: "#clauses-table",
    popover: {
      title: "Tabla de Cláusulas",
      description: "Aquí ves todas las cláusulas creadas.",
      side: "right"
    }
  },

  {
    // botón crear (ajusta si tu tabla usa otro id)
    element: "#clauses-table .create-button",
    popover: {
      title: "Crear nueva cláusula",
      description: "Haz clic para agregar una cláusula nueva.",
      side: "bottom"
    }
  },

  {
    element: "#clauses-page",
    popover: {
      title: "Fin del tour",
      description: "Ya conoces el módulo de cláusulas.",
      side: "center"
    }
  }
];
