import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';
import { FormModuleComponent } from '../../components/form-module/form-module.component';
import { RoleFormPermissionComponent } from '../../components/role-form-permission/role-form-permission.component';

@Component({
  selector: 'app-model-security',
  imports: [MatTabsModule, FormModuleComponent, RoleFormPermissionComponent],
  templateUrl: './model-security.component.html',
  styleUrl: './model-security.component.css'
})
export class ModelSecurityComponent implements OnInit {
  private readonly pageHeaderService = inject(PageHeaderService);

  ngOnInit(): void {
    this.pageHeaderService.setPageHeader('Formularios y Módulos', 'Asignación de formularios a módulos');
  }

  onTabChange(index: number): void {
    if (index === 0) {
      this.pageHeaderService.setPageHeader('Formularios y Módulos', 'Asignación de formularios a módulos');
    } else if (index === 1) {
      this.pageHeaderService.setPageHeader('Roles, Formularios y Permisos', 'Asignación de permisos a roles por formulario');
    }
  }
}

