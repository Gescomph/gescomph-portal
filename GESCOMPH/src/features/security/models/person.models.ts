export interface PersonSelectModel {
  id: number;         // BaseDto.Id
  firstName: string;
  lastName: string;
  document?: string;
  address?: string;
  phone?: string;
  cityName: string;
  cityId: number;
  email?: string;
  active?: boolean;   // SOLO si tu BaseDto lo incluye
}

export interface PersonCreateModel {
  firstName: string;
  lastName: string;
  document?: string;
  address?: string;
  phone?: string;
  cityId: number;
}

export interface PersonUpdateModel {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  cityId: number;
}
