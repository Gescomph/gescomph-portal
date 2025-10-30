import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { ChangePasswordComponent } from "../../components/change-password/change-password.component";
import { FinanceComponent } from "../../components/finance/finance.component";
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';
import { LocationSettingsComponent } from '../location-settings/location-settings.component';
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';

@Component({
  selector: 'app-main-settings',
  imports: [
    CommonModule,
    MatTabsModule,
    LocationSettingsComponent,
    FinanceComponent,
    ChangePasswordComponent,
    HasRoleAndPermissionDirective,
    ProfileFormComponent
  ],
  templateUrl: './main-settings.component.html',
  styleUrl: './main-settings.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class MainSettingsComponent implements OnInit {
  private readonly pageHeaderService = inject(PageHeaderService);

  ngOnInit(): void {
    this.pageHeaderService.setPageHeader('Finanzas', 'Gestión de finanzas');
  }

  onTabChange(index: number): void {
    if (index === 0) {
      this.pageHeaderService.setPageHeader('Actualiza tu información', 'Actualiza tus datos personales');
    } else if (index === 1) {
      this.pageHeaderService.setPageHeader('Finanzas', 'Gestión de finanzas');
    } else if (index === 2) {
      this.pageHeaderService.setPageHeader('Ubicación', 'Gestión de ubicaciones');
    } else if (index === 3) {
      this.pageHeaderService.setPageHeader('Seguridad', 'Cambio de contraseña');
    }
  }

}

