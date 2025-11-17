export interface RegisterModel {
  email: string;
  firstName: string;
  lastName: string;
  document: string;
  phone: string;
  address: string;
  cityId: number;
  personId?: number;
  roleIds?: number[];
}
