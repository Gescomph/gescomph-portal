import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  Input,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { firstValueFrom } from 'rxjs';

import { HasRoleAndPermissionDirective } from '../../../../../core/security/directives/has-role-and-permission.directive';
import { CardComponent } from '../../../../../shared/components/ui/card/card.component';
import { StandardButtonComponent } from '../../../../../shared/components/ui/standard-button/standard-button.component';
import { EstablishmentService } from '../../../services/establishment/establishment.service';
import { ImageService } from '../../../services/image/image.service';
import { EstablishmentStore } from '../../../store/establishment/establishment.store';
import { EstablishmentEventsService } from '../../../services/shared/establishment-events.service';
import { SweetAlertService } from '../../../../../shared/utils/notifications/sweet-alert.service';
import { EstablishmentSelect } from '../../../models/establishment.models';
import { SquareService } from '../../../services/square/square.service';
import { SquareSelectModel } from '../../../models/squares.models';

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
  private readonly imageService = inject(ImageService);
  private readonly plazaSvc = inject(SquareService);

  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly sharedEvents = inject(EstablishmentEventsService);
  private readonly destroyRef = inject(DestroyRef);

  // Input para filtrar por plaza (navegación jerárquica tenant)
  @Input() filterByPlazaId?: number | null = null;

  // Signal para controlar visibilidad del dropdown
  readonly showPlazaDropdown = signal<boolean>(true);

  readonly plazas = signal<SquareSelectModel[]>([]);


  // =========================
  selectedPlazaId = signal<number | null>(null);

  async onPlazaSelected(id: number | null) {
    this.selectedPlazaId.set(id);

    if (id === null) {
      await this.store.loadCardsAll(false);      // vuelve a ALL cards (false = mostrar todos, incluidos inactivos)
    } else {
      await this.store.loadCardsByPlaza(id, false); // (false = mostrar todos, incluidos inactivos)
    }

    this.pageIndex.set(0);
  }
  // =========================


  // === Signals principales del Store ===
  readonly cards = this.store.cards;
  readonly loadingCards = this.store.cardsLoading;
  readonly errorCards = this.store.cardsError;

  // === Signals para paginación ===
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly filterControl = new FormControl('');
  readonly filterValue = toSignal(this.filterControl.valueChanges, { initialValue: '' });

  readonly filteredEstablishments = computed(() => {
    const txt = (this.filterValue() ?? '').toLowerCase();
    return this.cards().filter(p =>
      p.name.toLowerCase().includes(txt) ||
      p.address.toLowerCase().includes(txt) ||
      p.description?.toLowerCase().includes(txt)
    );
  });

  readonly pagedCards = computed(() => {
    const all = this.filteredEstablishments();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return all.slice(start, end);
  });


  async ngOnInit(): Promise<void> {

    // 1) cargar plazas para llenar el <mat-select>
    await this.loadPlazas();

    // 2) Si viene filterByPlazaId (navegación jerárquica), cargar solo esa plaza
    if (this.filterByPlazaId != null) {
      this.showPlazaDropdown.set(false); // Ocultar dropdown
      this.selectedPlazaId.set(this.filterByPlazaId);
      await this.store.loadCardsByPlaza(this.filterByPlazaId, true); // true = solo activos (Tenant)
    } else {
      // Carga inicial de establecimientos (todas las plazas)
      this.showPlazaDropdown.set(true); // Mostrar dropdown
      await this.store.loadCardsAll(false); // false = mostrar todos (Admin)
    }

    // 3) si cambian estados activos / inactivos de plazas → refrescar cards
    this.sharedEvents.plazaStateChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Refrescar según el modo actual
        if (this.filterByPlazaId != null) {
          void this.store.loadCardsByPlaza(this.filterByPlazaId, true);
        } else {
          void this.store.loadCardsAll(false);
        }
        this.pageIndex.set(0);
      });

    // 4) si usuario hizo click en card de plazas (SquareList) → aplicar filtro
    this.sharedEvents.plazaFilterSelected$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async plazaId => {
        this.selectedPlazaId.set(plazaId);
        // Si viene de evento compartido (Admin tab), cargar todos (false)
        await this.store.loadCardsByPlaza(plazaId, false);
        this.pageIndex.set(0);
      });
  }


  // === Métodos de paginación ===
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  private async loadPlazas(): Promise<void> {
    const data = await firstValueFrom(this.plazaSvc.getAll()); // o getAll()
    this.plazas.set(data ?? []);
  }

  // === Métodos de CRUD / UI ===
  openCreateDialog(): void {
    import('../form-establishment/form-establishment.component').then((m) => {
      this.dialog.closeAll();
      const ref = this.dialog.open(m.FormEstablishmentComponent, {
        id: 'createDialog',
        width: '600px',
        data: null,
        disableClose: true,
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
              maxHeight: '90vh',
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
      '../../../../appointment/components/form-appointment/form-appointment.component'
    );

    this.dialog.open(FormAppointmentComponent, {
      width: '600px',
      data: establishment,
      disableClose: true,
    });
  }

  async openEditDialogById(id: number): Promise<void> {
    try {
      const row = await firstValueFrom(this.estSvc.getById(id));
      if (!row) {
        this.sweetAlertService.showNotification('Error', 'Establecimiento no encontrado', 'error');
        return;
      }

      let images = row?.images ?? [];
      try {
        const remoteImages = await firstValueFrom(this.imageService.getImages('Establishment', id));
        if (remoteImages) {
          images = remoteImages;
        }
      } catch {
        // mantener imagenes existentes si la consulta falla
      }

      const data = { ...row, images };
      const { FormEstablishmentComponent } = await import('../form-establishment/form-establishment.component');
      this.dialog.closeAll();
      const ref = this.dialog.open(FormEstablishmentComponent, {
        id: 'editDialog',
        width: '600px',
        data,
        disableClose: true,
      });

      ref.afterClosed().subscribe(async (ok) => {
        if (ok) {
          await this.store.loadCardsAll();
          this.pageIndex.set(0);
        }
      });
    } catch {
      this.sweetAlertService.showNotification('Error', 'Establecimiento no encontrado', 'error');
    }
  }

}




