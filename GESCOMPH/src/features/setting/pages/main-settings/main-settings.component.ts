import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { PermissionService } from '../../../../core/security/permission/permission.service';
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';
import { ChangePasswordComponent } from "../../components/change-password/change-password.component";
import { SystemParametersComponent } from "../../components/system-parameters/system-parameters.component";
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';
import { LocationSettingsComponent } from '../location-settings/location-settings.component';
import { SETTINGS_MAIN_TOUR } from './settings-main-tour';
import { DriverJsService } from '../../../../shared/services/driver/driver-js.services';

@Component({
  selector: 'app-main-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
  ],
  templateUrl: './main-settings.component.html',
  styleUrl: './main-settings.component.css',
  encapsulation: ViewEncapsulation.None,
})

export class MainSettingsComponent implements OnInit {
  private readonly pageHeaderService = inject(PageHeaderService);
  private readonly permissionService = inject(PermissionService);
  private readonly driverJs = inject(DriverJsService);

  visibleTabs: { label: string; description: string; component: any; role?: string; perm?: string }[] = [];

  ngOnInit(): void {

    const allTabs = [
      {
        label: 'Actualiza tu información',
        description: 'Actualiza tus datos personales',
        component: ProfileFormComponent,
        role: undefined,
        perm: 'VER',
      },
      {
        label: 'Parámetros del sistema',
        description: 'Gestión de parámetros del sistema',
        component: SystemParametersComponent,
        role: 'Administrador',
        perm: 'VER',
      },
      {
        label: 'Ubicación',
        description: 'Gestión de ubicaciones',
        component: LocationSettingsComponent,
        role: 'Administrador',
        perm: 'VER',
      },
      {
        label: 'Seguridad',
        description: 'Cambio de contraseña',
        component: ChangePasswordComponent,
        role: undefined,
        perm: 'VER',
      },
    ];

    this.visibleTabs = allTabs.filter(tab => {
      if (tab.role && !this.permissionService.hasRole(tab.role)) return false;
      if (tab.perm && !this.permissionService.hasPermission(tab.perm)) return false;
      return true;
    });

    // Inicializa el header
    if (this.visibleTabs.length > 0) {
      this.pageHeaderService.setPageHeader(this.visibleTabs[0].label, this.visibleTabs[0].description);
    }

    this.driverJs.registerSteps('/settings/main', SETTINGS_MAIN_TOUR);
  }

  onTabChange(index: number): void {
    const tab = this.visibleTabs[index];
    if (tab) {
      this.pageHeaderService.setPageHeader(tab.label, tab.description);
    }
  }
}
