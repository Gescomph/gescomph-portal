import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from 'chart.js';
import { take } from 'rxjs/operators';
import { CircleChartComponent } from "../../../../../shared/components/charts/circle-chart/circle-chart.component";
import { LineChartComponent } from "../../../../../shared/components/charts/line-chart/line-chart.component";
import { EstablishmentSelect } from '../../../../establishments/models/establishment.models';
import { EstablishmentService } from '../../../../establishments/services/establishment/establishment.service';
import { CardInfoComponent } from '../../../components/card-info/card-info.component';
import { QuickActionComponent } from '../../../components/quick-action/quick-action.component';

import { HasRoleAndPermissionDirective } from '../../../../../core/security/directives/has-role-and-permission.directive';
import { PageHeaderService } from '../../../../../shared/services/page-header/page-header.service';
import { ContractSelectModel } from '../../../../contracts/models/contract.models';
import { ChartObligationsMonths } from '../../../../contracts/models/obligation-month.models';
import { ContractService } from '../../../../contracts/services/contract/contract.service';
import { DashboardService } from '../../../services/dashboard.service';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, CardInfoComponent, QuickActionComponent, CircleChartComponent, LineChartComponent, HasRoleAndPermissionDirective],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent implements OnInit {

  private readonly pageHeaderService = inject(PageHeaderService);
  private readonly establishmentService = inject(EstablishmentService);
  private readonly contractService = inject(ContractService);
  private readonly obligationService = inject(DashboardService)

  readonly establishments = signal<readonly EstablishmentSelect[]>([]);
  readonly contract = signal<readonly ContractSelectModel[]>([]);
  readonly obligationsChart = signal<readonly ChartObligationsMonths[]>([]);

  readonly obligationsLabels = computed(() => this.obligationsChart().map(c => c.label));
  readonly obligationsData = computed(() => this.obligationsChart().map(c => c.total));

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Derivados como en Establishment-list
  readonly activeEstablishment = computed(() =>
    this.establishments().filter(e => e.active).length
  );

  readonly inactiveEstablishment = computed(() =>
    this.establishments().filter(e => !e.active).length
  );

  // Derivados como en Establishment-list
  readonly activeContract = computed(() =>
    this.contract().filter(e => e.active).length
  );
  readonly inactiveContract = computed(() =>
    this.contract().filter(e => !e.active).length
  );

  ngOnInit(): void {
    this.pageHeaderService.setPageHeader('Inicio', 'Página Principal - GESCOMPH');
    this.loadEstablishments();
    this.loadContract();
    this.loadObligationsTotalMonthsChart();
    this.loadAppointments();
    this.driverJs.registerSteps('/dashboard', DASHBOARD_TOUR);
  }

  private loadEstablishments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.establishmentService.getAll().pipe(take(1)).subscribe({
      next: (list) => this.establishments.set(list),
      error: (err) => this.error.set(err?.message || 'Error al cargar establecimientos'),
      complete: () => this.loading.set(false),
    });
  }

  private loadContract(): void {
    this.loading.set(true);
    this.error.set(null);

    this.contractService.getAll().pipe(take(1)).subscribe({
      next: (list) => this.contract.set(list),
      error: (err) => this.error.set(err?.message || 'Error al cargar establecimientos'),
      complete: () => this.loading.set(false),
    });
  }

  loadObligationsTotalMonthsChart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.obligationService.getLastSixMonthsPaid().subscribe({
      next: (data: any) => {
        // 🔹 Asegura que siempre sea un array
        const list = Array.isArray(data) ? data : [data];

        if (!list || list.length === 0) {
          this.error.set('No se encontraron obligaciones para los últimos seis meses.');
          this.obligationsChart.set([]);
        } else {
          this.obligationsChart.set(list);
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar obligaciones:', err);
        this.error.set('Ocurrió un error al cargar los datos.');
        this.obligationsChart.set([]);
        this.loading.set(false);
      }
    });
  }


}



