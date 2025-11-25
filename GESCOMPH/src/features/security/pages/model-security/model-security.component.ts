import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';
import { FormModuleComponent } from '../../components/form-module/form-module.component';
import { RoleFormPermissionComponent } from '../../components/role-form-permission/role-form-permission.component';
import { SECURITY_MAIN_TOUR } from './security-main-tour';
import { DriverJsService } from '../../../../shared/services/driver/driver-js.services';

@Component({
  selector: 'app-model-security',
  imports: [MatTabsModule, FormModuleComponent, RoleFormPermissionComponent],
  templateUrl: './model-security.component.html',
  styleUrl: './model-security.component.css'
})
export class ModelSecurityComponent implements OnInit {
  private readonly pageHeaderService = inject(PageHeaderService);
  private readonly driverJs = inject(DriverJsService);

  ngOnInit(): void {
    this.pageHeaderService.setPageHeader('Formularios y Módulos', 'Asignación de formularios a módulos');
    this.driverJs.registerSteps('security/main', SECURITY_MAIN_TOUR);
  }

  onTabChange(index: number): void {
    if (index === 0) {
      this.pageHeaderService.setPageHeader('Formularios y Módulos', 'Asignación de formularios a módulos');
    } else if (index === 1) {
      this.pageHeaderService.setPageHeader('Roles, Formularios y Permisos', 'Asignación de permisos a roles por formulario');
    }
  }
}

