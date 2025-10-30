import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { CardComponent } from '../../../../shared/components/ui/card/card.component';
import { StandardButtonComponent } from '../../../../shared/components/ui/standard-button/standard-button.component';
import { EstablishmentService } from '../../services/establishment/establishment.service';
import { EstablishmentStore } from '../../store/establishment/establishment.store';
import { EstablishmentEventsService } from '../../services/shared/establishment-events.service';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { EstablishmentSelect } from '../../models/establishment.models';

@Component({
  selector: 'app-establishments-list',
  imports: [
    CommonModule,
    CardComponent,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatStepperModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    HasRoleAndPermissionDirective,
    StandardButtonComponent,
  ],
  templateUrl: './establishments-list.component.html',
  styleUrls: ['./establishments-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstablishmentsListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(EstablishmentStore);
  private readonly estSvc = inject(EstablishmentService);
  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly sharedEvents = inject(EstablishmentEventsService);
  private readonly destroyRef = inject(DestroyRef);

  // === Signals principales del Store ===
  readonly cards = this.store.cards;
  readonly loadingCards = this.store.cardsLoading;
  readonly errorCards = this.store.cardsError;

  // === Signals para paginación ===
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly pagedCards = computed(() => {
    const all = this.cards();
    if (!all) return [];
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return all.slice(start, end);
  });

  async ngOnInit(): Promise<void> {
    // Carga inicial de establecimientos
    await this.store.loadCardsAll();

    // Si hay cambios externos, recargar
    this.sharedEvents.plazaStateChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.store.loadCardsAll();
        this.pageIndex.set(0);
      });
  }

  // === Métodos de paginación ===
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  // === Métodos de CRUD / UI ===
  openCreateDialog(): void {
    import('../form-establishment/form-establishment.component').then((m) => {
      this.dialog.closeAll();
      const ref = this.dialog.open(m.FormEstablishmentComponent, {
        id: 'createDialog',
        width: '600px',
        data: null,
      });
      ref.afterClosed().subscribe(async (ok) => {
        if (ok) {
          await this.store.loadCardsAll();
          this.pageIndex.set(0);
        }
      });
    });
  }

  async handleDelete(id: number): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      '¿Está seguro?',
      'Esta acción no se puede deshacer'
    );
    if (!result.isConfirmed) return;

    try {
      await this.store.delete(id);
      this.sweetAlertService.showNotification(
        'Éxito',
        'Local eliminado exitosamente',
        'success'
      );
      await this.store.loadCardsAll();
      this.pageIndex.set(0);
    } catch (err: any) {
      this.sweetAlertService.showNotification(
        'Error',
        err?.message || 'No se pudo eliminar',
        'error'
      );
    }
  }

  onCardUpdated(): void {
    void this.store.loadCardsAll();
    this.pageIndex.set(0);
  }

  onView(id: number): void {
    if (this.dialog.getDialogById('viewDialog')) {
      return;
    }

    this.estSvc.getById(id).subscribe({
      next: (row) => {
        if (!row) {
          this.sweetAlertService.showNotification(
            'Error',
            'Establecimiento no encontrado',
            'error'
          );
          return;
        }

        import('../establishment-detail-dialog/establishment-detail-dialog.component')
          .then((m) => {
            const dialogRef = this.dialog.open(m.EstablishmentDetailDialogComponent, {
              id: 'viewDialog',
              data: row,
              width: '80vw',
              maxWidth: '900px',
              height: 'auto',
              maxHeight: 'none',
              panelClass: 'no-scroll-dialog'
            });

            dialogRef.afterClosed().subscribe(async (result) => {
              if (result?.action !== 'createAppointment') {
                return;
              }
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
          })
          .catch(() =>
            this.sweetAlertService.showNotification(
              'Error',
              'Error al cargar el establecimiento',
              'error'
            )
          );
      },
      error: () =>
        this.sweetAlertService.showNotification(
          'Error',
          'Establecimiento no encontrado',
          'error'
        ),
    });
  }

  private async openAppointmentDialog(establishment: EstablishmentSelect): Promise<void> {
    const { FormAppointmentComponent } = await import(
      '../../../appointment/components/form-appointment/form-appointment.component'
    );

    this.dialog.open(FormAppointmentComponent, {
      width: '600px',
      data: establishment,
    });
  }

  openEditDialogById(id: number): void {
    this.estSvc.getById(id).subscribe({
      next: (row) => {
        import('../form-establishment/form-establishment.component').then(
          (m) => {
            this.dialog.closeAll();
            const ref = this.dialog.open(m.FormEstablishmentComponent, {
              id: 'editDialog',
              width: '600px',
              data: row,
            });
            ref.afterClosed().subscribe(async (ok) => {
              if (ok) {
                await this.store.loadCardsAll();
                this.pageIndex.set(0);
              }
            });
          }
        );
      },
      error: () =>
        this.sweetAlertService.showNotification(
          'Error',
          'Establecimiento no encontrado',
          'error'
        ),
    });
  }
}
