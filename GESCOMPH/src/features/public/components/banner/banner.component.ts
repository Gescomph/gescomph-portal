import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarruselComponent } from '../carrusel/carrusel.component';
import { MatIconModule } from '@angular/material/icon';
import { EstablishmentStore } from '../../../establishments/store/establishment/establishment.store';
import { AppointmentStore } from '../../../appointment/store/appointment.store';
import { ContractStore } from '../../../contracts/store/contract.store';
import { CountUpPipe } from '../../../../shared/pipes/count-up.pipe';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [RouterLink, CarruselComponent, MatIconModule, CountUpPipe, AsyncPipe],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {

  private readonly establishmentStore = inject(EstablishmentStore);
  private readonly appointmentStore = inject(AppointmentStore);
  private readonly contractStore = inject(ContractStore);

  readonly rowsEstablishments = this.establishmentStore.items;
  readonly rowsAppointments   = this.appointmentStore.appointments;
  readonly metricsContracts   = this.contractStore.publicMetrics;

  constructor() {
    this.contractStore.loadPublicMetrics();
  }

  readonly totalEstablishmentsCount = computed(() => this.rowsEstablishments()?.length ?? 0);
  readonly totalAppointmensCount   = computed(() => this.rowsAppointments()?.length ?? 0);
  readonly totalContractsCount     = computed(() => this.metricsContracts()?.total ?? 0);
}
