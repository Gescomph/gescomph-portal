import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, computed, effect, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GenericTableComponent } from '../../../../../shared/components/feedback/generic-table/generic-table.component';
import { ToggleButtonComponent } from '../../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { TableColumn } from '../../../../../shared/models/table-column.models';

import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { HasRoleAndPermissionDirective } from '../../../../../core/security/directives/has-role-and-permission.directive';
import { SweetAlertService } from '../../../../../shared/utils/notifications/sweet-alert.service';
import { SquareSelectModel, SquareUpdateModel } from '../../../models/squares.models';
import { SquareStore } from '../../../store/square/square.store';
import { EstablishmentEventsService } from '../../../services/shared/establishment-events.service';
import { firstValueFrom } from 'rxjs';
import { SquareService } from '../../../services/square/square.service';
import { ImageService } from '../../../services/image/image.service';
import { CardComponent } from '../../../../../shared/components/ui/card/card.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { StandardButtonComponent } from '../../../../../shared/components/ui/standard-button/standard-button.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-square-list',
  imports: [
    CommonModule,
    ToggleButtonComponent,
    HasRoleAndPermissionDirective,
    MatProgressSpinnerModule,
    CardComponent,


    ReactiveFormsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    StandardButtonComponent
  ],
  templateUrl: './square-list.component.html',
  styleUrl: './square-list.component.css'
})
export class SquareListComponent implements OnInit {
  private readonly squaresStore = inject(SquareStore);
  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly sharedEvents = inject(EstablishmentEventsService);
  private readonly dialog = inject(MatDialog);
  private readonly squareService = inject(SquareService);
  private readonly imageService = inject(ImageService);





  readonly squares = this.squaresStore.items;
  readonly loading = this.squaresStore.loading;
  readonly error = this.squaresStore.error;

  selectedSquare: SquareSelectModel | null = null;
  columns: TableColumn<SquareSelectModel>[] = [];



  onPlazaCardClick(id: number) {
    this.sharedEvents.notifyPlazaFilterSelected(id);
    this.sharedEvents.notifyGoToEstablishmentsTab();
  }

  openEstablishmentsOfPlaza(plaza: SquareSelectModel) {
    this.sharedEvents.notifyPlazaFilterSelected(plaza.id);

    // le pedimos al padre cambiar tab:
    this.sharedEvents.notifyGoToEstablishmentsTab();
  }

  // NUEVO
  // === Filtro y paginación ===
  filterControl = new FormControl('');
  readonly filterValue = toSignal(this.filterControl.valueChanges, { initialValue: '' }); //  señal reactiva
  pageIndex = 0;
  pageSize = 6;

  // === Computed reactivos ===
  readonly filteredSquares = computed(() => {
    const txt = (this.filterValue() ?? '').toLowerCase();
    return this.squares().filter(p =>
      p.name?.toLowerCase().includes(txt) ||
      p.description?.toLowerCase().includes(txt)
    );
  });

  readonly pagedSquares = computed(() => {
    const start = this.pageIndex * this.pageSize;
    return this.filteredSquares().slice(start, start + this.pageSize);
  });
  ;

  onPage(e: any) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
  }

  @ViewChild('estadoTemplate', { static: true }) estadoTemplate!: TemplateRef<any>;

  async ngOnInit(): Promise<void> {
    await this.squaresStore.loadAll();
    this.columns = [
      { key: 'name', header: 'Nombre' },
      { key: 'description', header: 'Descripción' },
      { key: 'location', header: 'Ubicación' },
      { key: 'active', header: 'Estado', type: 'custom', template: this.estadoTemplate }
    ];
  }

  // Notificación de error estandarizada
  private readonly errorToast = effect(() => {
    const err = this.error();
    if (err) {
      this.sweetAlertService.showApiError(err, 'No se pudieron cargar las plazas.');
    }
  });

  onView(row: SquareSelectModel) { }

  onCreate(): void {
    import('../form-square/form-square.component').then(m => {
      const ref = this.dialog.open(m.FormSquareComponent, {
        width: '650px',
        data: null,   // o data vacía
        disableClose: true,
      });

      ref.afterClosed().subscribe(async ok => {
        if (ok) {
          await this.squaresStore.loadAll();
        }
      });
    });

  }

  onEdit(row: SquareUpdateModel): void {
    import('../form-square/form-square.component').then(async m => {
      const full: any = await firstValueFrom(this.squareService.getById(row.id));
      try {
        const images = await firstValueFrom(this.imageService.getImages('Plaza', row.id));
        full.images = images ?? [];
      } catch {
        full.images = full.images ?? [];
      }

      const ref = this.dialog.open(m.FormSquareComponent, {
        width: '650px',
        data: full,
        disableClose: true,
      });

      ref.afterClosed().subscribe(async ok => {
        if (ok) {
          await this.squaresStore.loadAll();
        }
      });
    });
  }




  async onDelete(row: SquareSelectModel): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      'Eliminar plaza',
      `¿Deseas eliminar la plaza "${row.name}"?`,
      'Eliminar',
      'Cancelar',
      'warning'
    );
    if (!result.isConfirmed) return;
    try {
      await this.squaresStore.deleteLogic(row.id);
      this.sweetAlertService.showNotification('Eliminación exitosa', 'Plaza eliminada correctamente.', 'success');
    } catch (err) {
      this.sweetAlertService.showApiError(err, 'No se pudo eliminar la plaza.');
    }
  }

  async onToggleActive(
    id: number | null | undefined,
    e: { checked: boolean } | boolean | null | undefined
  ): Promise<void> {
    if (id == null) {
      this.sweetAlertService.showNotification('Sin plaza', 'No se pudo obtener el ID de la plaza.', 'warning');
      return;
    }
    const checked = typeof e === 'boolean' ? e : !!e?.checked;
    try {
      const res = await this.squaresStore.changeActiveStatusRemote(id, checked);
      if (!res?.ok) {
        const msg = res?.message || 'No se pudo cambiar el estado de la plaza.';
        this.sweetAlertService.showNotification('Operación no permitida', msg, 'warning');
        return;
      }
      this.sharedEvents.notifyPlazaStateChanged(id);
      this.sweetAlertService.showNotification('Éxito', `Plaza ${checked ? 'activada' : 'desactivada'} correctamente.`, 'success');
    } catch (err: any) {
      const detail = err?.error?.detail || err?.error?.message || err?.error?.title || err?.message;
      const msg = detail || 'No se pudo cambiar el estado de la plaza.';
      this.sweetAlertService.showNotification('Operación no permitida', msg, 'warning');
    }
  }

  trackById = (_: number, item: SquareSelectModel) => item.id;

  isBusy(id: number | null | undefined): boolean {
    return typeof id === 'number' ? this.squaresStore.isBusy(id) : false;
  }
}




