import { ClauseSelect } from "./clause.models";
import { PremisesLeasedModel } from "./premises-leased.models";

export interface ContractCreateModel {
  firstName: string;
  lastName: string;
  document: string;
  phone: string;
  address: string;
  cityId: number;
  email?: string | null;

  startDate: string;
  endDate: string;

  establishmentIds: number[];
  useSystemParameters: boolean;
  clauseIds: number[];
}

export interface ContractSelectModel {
  id: number;
  startDate: string;
  endDate: string;
  active: boolean;

  personId: number;
  fullName: string;
  document: string;
  phone: string;
  email: string | null;
  address: string | null;

  totalBaseRentAgreed: number;
  totalUvtQtyAgreed: number;

  premisesLeased: PremisesLeasedModel[];
  clauses: ClauseSelect[];
}


export interface ContractPublicMetricsDto {
  total: number;
  activos: number;
  inactivos: number;
}

