import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { FooterComponent } from '../../../../layout/footer/footer.component';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { EstablishmentSelect } from '../../../establishments/models/establishment.models';
import { EstablishmentStore } from '../../../establishments/store/establishment/establishment.store';
import { BannerComponent } from '../../components/banner/banner.component';
import { EstablishmentsComponent } from '../../components/establishments/establishments.component';
import { HistoryComponent } from '../../components/history/history.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  imports: [
    CommonModule,
    BannerComponent,
    HistoryComponent,
    EstablishmentsComponent,
    FooterComponent,
    MatIconModule
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  // Inyecciones de dependencias
  private readonly store = inject(EstablishmentStore);
  private readonly dialog = inject(MatDialog);
  private readonly sweetAlertService = inject(SweetAlertService);

  // Estado reactivo proveniente del store (Signal)
  readonly items = this.store.items;

  async ngOnInit(): Promise<void> {
    // Carga inicial de establecimientos (solo activos, límite 6)
    await this.store.loadAll({ limit: 6, activeOnly: true });
  }

  // Evento proveniente del hijo <app-establishments>
  async onView(id: number): Promise<void> {
    try {
      const row = await this.store.getById(id);
      if (!row) {
        this.sweetAlertService.showNotification(
          'Error',
          'Establecimiento no encontrado',
          'error'
        );
        return;
      }

      const { EstablishmentDetailDialogComponent } = await import(
        '../../../establishments/components/establishment/establishment-detail-dialog/establishment-detail-dialog.component'
      );

      const dialogRef = this.dialog.open(EstablishmentDetailDialogComponent, {
        data: row,
        width: '80vw',
        maxWidth: '900px',
        height: 'auto',
        maxHeight: 'none',
        panelClass: 'no-scroll-dialog'
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result?.action !== 'createAppointment') return;
        try {
          await this.openAppointmentDialog(row);
        } catch {
          this.sweetAlertService.showNotification(
            'Error',
            'Error al abrir formulario de cita',
            'error'
          );
        }
      });
    } catch {
      this.sweetAlertService.showNotification(
        'Error',
        'Error al cargar el establecimiento',
        'error'
      );
    }
  }

  // Evento proveniente del hijo <app-establishments>
  async onCreateAppointment(id: number): Promise<void> {
    try {
      const row = await this.store.getById(id);
      if (!row) {
        this.sweetAlertService.showNotification(
          'Error',
          'Establecimiento no encontrado',
          'error'
        );
        return;
      }
      await this.openAppointmentDialog(row);
    } catch {
      this.sweetAlertService.showNotification(
        'Error',
        'Error al abrir formulario de cita',
        'error'
      );
    }
  }

  private async openAppointmentDialog(establishment: EstablishmentSelect): Promise<void> {
    const { FormAppointmentComponent } = await import(
      '../../../appointment/components/form-appointment/form-appointment.component'
    );

    this.dialog.open(FormAppointmentComponent, {
      width: '600px',
      data: establishment,
      disableClose: true,
    });
  }
}
