import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { EstablishmentsListComponent } from "../../components/establishments-list/establishments-list.component";
import { SquareListComponent } from "../../components/square-list/square-list.component";
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';

@Component({
  selector: 'app-squares-establishments',
  imports: [MatTabsModule, SquareListComponent, EstablishmentsListComponent, HasRoleAndPermissionDirective],
  templateUrl: './squares-establishments.component.html',
  styleUrl: './squares-establishments.component.css'
})
export class SquaresEstablishmentsComponent implements OnInit {
  private readonly pageHeaderService = inject(PageHeaderService);

  ngOnInit(): void {
    this.pageHeaderService.setPageHeader('Plazas', 'Gestión de Plazas');
  }

  onTabChange(index: number): void {
    if (index === 0) {
      this.pageHeaderService.setPageHeader('Plazas', 'Gestión de Plazas');
    } else if (index === 1) {
      this.pageHeaderService.setPageHeader('Establecimientos', 'Gestión de Establecimientos');
    }
  }
}

