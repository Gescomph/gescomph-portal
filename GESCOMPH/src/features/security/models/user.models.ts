export interface UserSelectModel {
  id: number;                // BaseDto.Id
  personId: number;

  personName: string;
  personDocument: string;
  personAddress: string;
  personPhone: string;

  email: string;

  cityId: number;
  cityName: string;

  departmentId: number;
  departmentName: string;

  active: boolean;
  roles: string[];
}

export interface UserCreateModel {
  email: string;
  personId: number;
  roleIds?: number[];
}

export interface UserUpdateModel {
  id: number;
  email: string;
  personId: number;
  roleIds?: number[];
}


export interface UserRegisterModel {
  email: string;
  firstName: string;
  lastName: string;
  document: string;
  phone: string;
  address: string;
  cityId: number;
  roleIds?: number[];
  personId?: number;
}

export interface UserRegisterResultModel {
  email: string;
  personId: number;
  roleIds: number[];
  cityId?: number;
  cityName?: string;
  departmentId?: number;
  departmentName?: string;
}
