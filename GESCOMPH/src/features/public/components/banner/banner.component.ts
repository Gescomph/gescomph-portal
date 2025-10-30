import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarruselComponent } from '../carrusel/carrusel.component';
import { MatIconModule } from '@angular/material/icon';
import { EstablishmentStore } from '../../../establishments/store/establishment/establishment.store';
import { EstablishmentCard } from '../../../establishments/models/establishment.models';
import { AppointmentStore } from '../../../appointment/store/appointment.store';
import { ContractStore } from '../../../contracts/store/contract.store';

@Component({
  selector: 'app-banner',
  imports: [RouterLink, CarruselComponent, MatIconModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {

  private readonly establishmentSrote = inject(EstablishmentStore);

  private readonly appointmentStore = inject(AppointmentStore);

  private readonly contractStore = inject(ContractStore);

  readonly rowsEstablishments = this.establishmentSrote.items;
  readonly rowsAppointments = this.appointmentStore.appointments$;
  readonly rowsContracs = this.contractStore.items;

  readonly totalEstablishmentsCount = computed(() => this.rowsEstablishments()?.length ?? 0);

  readonly totalAppointmensCount = computed(() => this.rowsEstablishments()?.length ?? 0);

  readonly totalContractsCount = computed(() => this.rowsEstablishments()?.length ?? 0);

}
