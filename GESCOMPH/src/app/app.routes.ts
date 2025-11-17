import { Routes } from '@angular/router';
import { authGuard } from '../core/security/guards/auth.guard';
import { publicGuard } from '../core/security/guards/public.guard';
import { LandingComponent } from '../features/public/pages/landing/landing.component';
import { LayoutComponent } from '../layout/layout.component';
import { NotFoundComponent } from '../shared/components/feedback/not-found/not-found.component';
import { EstablishmentListComponent } from '../features/public/pages/establishment-list/establishment-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingComponent, canActivate: [publicGuard], title: 'Inicio' },
  { path: 'establishments', pathMatch: 'full', component: EstablishmentListComponent, canActivate: [publicGuard], title: 'Establecimientos Disponibles' },

  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('../features/auth-login/auth.routes').then(m => m.AUTH_ROUTES),
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canMatch: [authGuard],
        loadChildren: () => import('../features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        title: 'Dashboard',
      },
      {
        path: 'establishments',
        canMatch: [authGuard],
        loadChildren: () => import('../features/establishments/establishments.routes').then(m => m.ESTABLISHMENTS_ROUTES),
        title: 'Establecimientos',
      },
      {
        path: 'contracts',
        canMatch: [authGuard],
        loadChildren: () => import('../features/contracts/contracts.routes').then(m => m.CONTRACTS_ROUTES),
        title: 'Contratos',
      },
      {
        path: 'appointment',
        canMatch: [authGuard],
        loadChildren: () => import('../features/appointment/appointment.routes').then(m => m.APPOINTMENT_ROUTES),
        title: 'Citas',
      },
      {
        path: 'security',
        canMatch: [authGuard],
        loadChildren: () => import('../features/security/security.routes').then(m => m.SECURITY_ROUTES),
        title: 'Seguridad',
      },
      {
        path: 'settings',
        canMatch: [authGuard],
        loadChildren: () => import('../features/setting/setting.routes').then(m => m.SETTING_ROUTES),
        title: 'Configuración',
      },
    ],
  },

  { path: '**', component: NotFoundComponent, title: 'No encontrado' },
];
