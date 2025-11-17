export interface SystemParameterSelectModel {
  id: number;
  key: string;
  value: string;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date | null;
  active: boolean;
}

export interface SystemParameterCreateModel {
  id: number;
  key: string;
  value: string;
  effectiveFrom: string | Date;
  effectiveTo: string | Date | null;
  active: boolean;
}

export interface SystemParameterUpdateModel {
  id: number;
  key: string;
  value: string;
  effectiveFrom: string | Date;
  effectiveTo: string | Date | null;
  active: boolean;
}
