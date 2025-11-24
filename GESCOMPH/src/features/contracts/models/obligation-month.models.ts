/**
 * Enum de estados de obligación mensual
 * Debe coincidir exactamente con Entity.Enum.Status del backend
 */
export enum ObligationStatus {
  Pendiente = 'Pendiente',    // 1 - Estado inicial
  Asignada = 'Asignada',      // 2
  Aprobada = 'Aprobada',      // 3 - Pagada/Aprobada
  Finalizada = 'Finalizada',  // 4
  Rechazada = 'Rechazada',    // 5
  Vencida = 'Vencida',        // 6 - Vencida/Overdue
  Pagada = 'Pagada',          // 7
  PreJuridico = 'PreJuridico',// 8
  Juridico = 'Juridico'       // 9
}

export interface MonthlyObligation {
  id: number;

  contractId: number;
  year: number;
  month: number;

  dueDate: string;
  paymentDate?: string | null;

  uvtQtyApplied: number;
  uvtValueApplied: number;
  vatRateApplied: number;

  baseAmount: number;
  vatAmount: number;
  totalAmount: number;

  daysLate?: number | null;
  lateAmount?: number | null;

  status: string; // Viene como string del backend (nombre del enum)
  locked: boolean;
  active: boolean;
}

export interface ChartObligationsMonths {
  label: string;
  total: number;
}
