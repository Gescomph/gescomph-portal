export interface RoleUserSelectModel {
  id: number;
  userId: number;
  userEmail: string;
  rolId: number;
  rolName: string;
  active: boolean;
}

export interface RoleUserCreateModel {
  userId: number;
  rolId: number;
  active: boolean;
}

export interface RoleUserUpdateModel {
  userId: number;
  rolId: number;
  active: boolean;
}
