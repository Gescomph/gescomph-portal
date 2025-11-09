export interface RoleFormPermissionCreateModel {
  rolId: number;
  formId: number;
  permissionIds: number[];
}


export interface RoleFormPermissionUpdateModel {
  id: number;
  rolId: number;
  formId: number;
  permissionIds: number[];
  active: boolean;

}

// --- NUEVOS MODELOS PARA LA VISTA AGRUPADA ---
export interface RoleFormPermissionGroupedModel {
  id: number;
  rolId: number;
  rolName: string;
  formId: number;
  formName: string;
  permissions: PermissionInfo[];
  active: boolean;
}

export interface PermissionInfo {
  permissionId: number;
  permissionName: string;
}


