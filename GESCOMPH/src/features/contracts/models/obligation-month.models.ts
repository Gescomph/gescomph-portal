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

  status: string;
  locked: boolean;
  active: boolean;
}

export interface ChartObligationsMonths {
  label: string;
  total: number;
}
