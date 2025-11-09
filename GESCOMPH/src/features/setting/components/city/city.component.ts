import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, Observable } from 'rxjs';
import { catchError, finalize, take, tap } from 'rxjs/operators';

import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { GenericTableComponent } from '../../../../shared/components/feedback/generic-table/generic-table.component';
import { ToggleButtonComponent } from '../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { TableColumn } from '../../../../shared/models/table-column.models';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { CitySelectModel } from '../../models/city.models';
import { CityStore } from '../../store/city/city.store';

@Component({
  selector: 'app-city',
  imports: [
    CommonModule,
    GenericTableComponent,
    MatButtonModule,
    MatIconModule,
    ToggleButtonComponent,
    HasRoleAndPermissionDirective
  ],
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CityComponent implements OnInit {
  cities$: Observable<CitySelectModel[]>;
  @ViewChild('estadoTemplate', { static: true }) estadoTemplate!: TemplateRef<any>;

  columns: TableColumn<CitySelectModel>[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nombre' },
    { key: 'departmentName', header: 'Departamento' }
  ];

  // Lock por ítem (evita doble clic)
  private busyIds = new Set<number>();
  isBusy = (id: number) => this.busyIds.has(id);

  // DI
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(
    private store: CityStore,
    private dialog: MatDialog,
    private sweetAlert: SweetAlertService
  ) {
    this.cities$ = this.store.cities$;
  }

  ngOnInit(): void {
    this.columns = [
      ...this.columns,
      { key: 'active', header: 'Estado', type: 'custom', template: this.estadoTemplate }
    ];
  }

  openCreateDialog(): void {
    import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.FormDialogComponent, {
        width: '400px',
        data: { entity: {}, formType: 'City' },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result) return;
        this.store.create(result).pipe(take(1)).subscribe({
          next: () => {
            this.sweetAlert.showNotification('Éxito', 'Ciudad creada exitosamente', 'success');
            this.cdr.markForCheck();
          }
        });
      });
    });
  }

  openEditDialog(row: CitySelectModel): void {
    import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.FormDialogComponent, {
        width: '400px',
        data: { entity: row, formType: 'City' },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result) return;
        this.store.update(result).pipe(take(1)).subscribe({
          next: () => {
            this.sweetAlert.showNotification('Éxito', 'Ciudad actualizada exitosamente', 'success');
            this.cdr.markForCheck();
          }
        });
      });
    });
  }

  handleDelete(row: CitySelectModel): void {
    if (!row.id) return;
    this.sweetAlert.showConfirm('¿Está seguro?', 'Esta acción no se puede deshacer').then(res => {
      if (!res.isConfirmed) return;
      this.store.delete(row.id!).pipe(take(1)).subscribe({
        next: () => {
          this.sweetAlert.showNotification('Éxito', 'Ciudad eliminada exitosamente', 'success');
          this.cdr.markForCheck();
        }
      });
    });
  }

  // Toggle activo/inactivo (UI optimista + rollback)
  onToggleActive(row: CitySelectModel, e: boolean | { checked: boolean }) {
    if (this.isBusy(row.id)) return;

    const checked = typeof e === 'boolean' ? e : !!e?.checked;
    const previous = row.active;

    // Optimistic UI + lock
    this.busyIds.add(row.id);
    row.active = checked;
    this.cdr.markForCheck();

    this.store.changeActiveStatus(row.id, checked).pipe(
      take(1),
      tap(updated => {
        // Si la API devuelve 204 No Content, updated será undefined
        row.active = updated?.active ?? checked;
        this.sweetAlert.showNotification(
          'Éxito',
          `Ciudad ${row.active ? 'activada' : 'desactivada'} correctamente.`,
          'success'
        );
        this.cdr.markForCheck();
      }),
      catchError(err => {
        // revertimos
        row.active = previous;
        this.sweetAlert.showNotification(
          'Error',
          err?.error?.detail || 'No se pudo cambiar el estado.',
          'error'
        );
        this.cdr.markForCheck();
        return EMPTY;
      }),
      finalize(() => {
        this.busyIds.delete(row.id);
        this.cdr.markForCheck();
      })
    ).subscribe();
  }
}
