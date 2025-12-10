import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CarruselComponent } from '../carrusel/carrusel.component';
import { MatIconModule } from '@angular/material/icon';
import { EstablishmentStore } from '../../../establishments/store/establishment/establishment.store';
import { AppointmentStore } from '../../../appointment/store/appointment.store';
import { ContractStore } from '../../../contracts/store/contract.store';
import { CountUpPipe } from '../../../../shared/pipes/count-up.pipe';
import { AsyncPipe } from '@angular/common';
import { TermsModalComponent } from '../../../terms-and-conditions/components/terms-modal/terms-modal.component';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [RouterLink, CarruselComponent, MatIconModule, MatDialogModule, CountUpPipe, AsyncPipe],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {

  private readonly establishmentStore = inject(EstablishmentStore);
  private readonly appointmentStore = inject(AppointmentStore);
  private readonly contractStore = inject(ContractStore);
  private readonly dialog = inject(MatDialog);

  readonly rowsEstablishments = this.establishmentStore.items;
  readonly rowsAppointments   = this.appointmentStore.appointments;
  readonly metricsContracts   = this.contractStore.publicMetrics;

  constructor() {
    this.contractStore.loadPublicMetrics();
  }

  readonly totalEstablishmentsCount = computed(() => this.rowsEstablishments()?.length ?? 0);
  readonly totalAppointmensCount   = computed(() => this.rowsAppointments()?.length ?? 0);
  readonly totalContractsCount     = computed(() => this.metricsContracts()?.total ?? 0);

  openTermsModal(): void {
    this.dialog.open(TermsModalComponent, {
      width: '90vw',
      maxWidth: '900px',
      height: '90vh',
      maxHeight: '800px',
      disableClose: true,
      data: {}
    });
  }
}
