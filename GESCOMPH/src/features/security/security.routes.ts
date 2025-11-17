import { Routes } from '@angular/router';
import { RoleComponent } from './pages/role/role.component';
import { ModelSecurityComponent } from './pages/model-security/model-security.component';
import { FormComponent } from './pages/form/form.component';
import { ModuleComponent } from './pages/module/module.component';
import { PermissionComponent } from './pages/permission/permission.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';

export const SECURITY_ROUTES: Routes = [
  { path: 'main', component: ModelSecurityComponent },
  { path: 'users', component: UserListComponent },
  { path: 'roles', component: RoleComponent },
  { path: 'forms', component: FormComponent },
  { path: 'modules', component: ModuleComponent },
  { path: 'permissions', component: PermissionComponent },
];
