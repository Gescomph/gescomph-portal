import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { EstablishmentsListComponent } from "../../components/establishment/establishments-list/establishments-list.component";
import { SquareListComponent } from "../../components/square/square-list/square-list.component";
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';
import { PermissionService } from '../../../../core/security/permission/permission.service';
import { CommonModule } from '@angular/common';
import { EstablishmentEventsService } from '../../services/shared/establishment-events.service';
import { ESTABLISHMENTS_TOUR } from './establishments-tour';
import { DriverJsService } from '../../../../shared/services/driver/driver-js.services';

@Component({
  selector: 'app-squares-establishments',
  imports: [
    MatTabsModule,
    EstablishmentsListComponent,
    SquareListComponent,
    HasRoleAndPermissionDirective,
    CommonModule,
    MatIconModule],
  templateUrl: './squares-establishments.component.html',
  styleUrl: './squares-establishments.component.css'
})
export class SquaresEstablishmentsComponent implements OnInit {
  private readonly pageHeaderService = inject(PageHeaderService);
  private readonly permissionService = inject(PermissionService);
  private readonly sharedEvents = inject(EstablishmentEventsService);
  private readonly driverJs = inject(DriverJsService);


  selectedIndex = signal(0);

  // Navegación jerárquica para arrendatario
  viewMode = signal<'plazas' | 'establishments'>('plazas');
  selectedPlazaId = signal<number | null>(null);
  selectedPlazaName = signal<string>('');

  // tabs dinámicos
  visibleTabs: { label: string; description: string; component: any; roles: string[] }[] = [];


  ngOnInit(): void {

    const allTabs = [
      { label: 'Plazas', component: SquareListComponent, roles: ['Administrador'], description: 'Gestión de Plazas' },
      { label: 'Establecimientos', component: EstablishmentsListComponent, roles: ['Administrador', 'Arrendador'], description: 'Gestión de Establecimientos' },
    ];

    this.visibleTabs = allTabs.filter(tab =>
      tab.roles.some(role => this.permissionService.hasRole(role))
    );

    const establishmentsIndex = this.visibleTabs.findIndex(t => t.label === 'Establecimientos');

    this.sharedEvents.goToEstablishmentsTab$
      .subscribe(() => {
        if (establishmentsIndex >= 0) {
          this.selectedIndex.set(establishmentsIndex);
        }
      });

    // Header inicial
    if (this.visibleTabs.length > 0) {
      const tab = this.visibleTabs[0];
      this.pageHeaderService.setPageHeader(tab.label, tab.description);
    }

    this.driverJs.registerSteps('/establishments/main', ESTABLISHMENTS_TOUR);
  }

  onTabChange(index: number): void {
    this.selectedIndex.set(index);
    const tab = this.visibleTabs[index];
    if (tab) {
      this.pageHeaderService.setPageHeader(tab.label, tab.description);
    }
  }

  // Métodos para navegación jerárquica (tenant)
  onPlazaCardClick(event: { id: number; name: string }): void {
    this.selectedPlazaId.set(event.id);
    this.selectedPlazaName.set(event.name);
    this.viewMode.set('establishments');
    this.pageHeaderService.setPageHeader(event.name, `Establecimientos en ${event.name}`);
  }

  onBackToPlazas(): void {
    this.viewMode.set('plazas');
    this.selectedPlazaId.set(null);
    this.selectedPlazaName.set('');
    this.pageHeaderService.setPageHeader('Plazas', 'Selecciona una plaza para ver sus establecimientos');
  }
}
