import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';

import { ClauseCreate, ClauseSelect, ClauseUpdate } from '../../models/clause.models';
import { ClauseService } from '../../services/clause/clause.service';
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { GenericTableComponent } from '../../../../shared/components/feedback/generic-table/generic-table.component';
import { TableColumn } from '../../../../shared/models/table-column.models';
import { ToggleButtonComponent } from '../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { DriverJsService } from '../../../../shared/services/driver/driver-js.services';
import { CLAUSES_TOUR } from './clauses-tours';

@Component({
  selector: 'app-clauses-list',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    GenericTableComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './clauses-list.component.html',
  styleUrls: ['./clauses-list.component.css'],
})
export class ClausesListComponent implements OnInit {
  private readonly clauseService = inject(ClauseService);
  private readonly dialog = inject(MatDialog);
  private readonly pageHeader = inject(PageHeaderService);
  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly driverJs = inject(DriverJsService);

  columns: TableColumn<ClauseSelect>[] = [];
  clauses: ClauseSelect[] = [];
  loading = false;

  @ViewChild('estadoTemplate', { static: true }) estadoTemplate!: TemplateRef<any>;

  ngOnInit(): void {
    this.pageHeader.setPageHeader('Cláusulas', 'Catálogo de cláusulas de contrato');
    this.columns = [
      { key: 'name', header: 'Nombre' },
      { key: 'description', header: 'Descripción' },
      { key: 'active', header: 'Estado', type: 'custom', template: this.estadoTemplate },
    ];
    this.loadClauses();
    this.driverJs.registerSteps('/contracts/clauses', CLAUSES_TOUR);
  }

  reload(): void {
    this.loadClauses();
  }

  startCreate(): void {
    this.openDialog();
  }

  startEdit(clause: ClauseSelect): void {
    this.openDialog(clause);
  }

  async delete(clause: ClauseSelect): Promise<void> {
    const res = await this.sweetAlertService.showConfirm(
      '¿Eliminar cláusula?',
      `Eliminar "${clause.name}"`,
      'Eliminar',
      'Cancelar'
    );
    if (!res.isConfirmed) return;

    this.loading = true;
    this.clauseService
      .delete(clause.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.clauses = this.clauses.filter(c => c.id !== clause.id);
          this.sweetAlertService.showNotification('Éxito', 'Cláusula eliminada', 'success');
        },
        error: (err) => {
          const msg = this.resolveErrorMessage(err) ?? 'No se pudo eliminar';
          this.sweetAlertService.showNotification('Error', msg, 'error');
        },
      });
  }

  onToggleActive(id: number, active: boolean): void {
    const current = this.clauses.find(c => c.id === id);
    if (!current) return;

    const previous = { ...current };
    this.clauses = this.clauses.map(c => (c.id === id ? { ...c, active } : c));

    const body: ClauseUpdate = {
      id,
      name: current.name ?? '',
      description: current.description ?? '',
      active,
    };

    this.clauseService.update(body).pipe(take(1)).subscribe({
      next: (updated) => {
        if (updated?.id != null) {
          this.clauses = this.clauses.map(c => (c.id === updated.id ? updated : c));
        }
        this.sweetAlertService.showNotification(
          'Estado actualizado',
          active ? 'Cláusula activada' : 'Cláusula desactivada',
          'success'
        );
      },
      error: (err) => {
        this.clauses = this.clauses.map(c => (c.id === id ? previous : c));
        const msg = this.resolveErrorMessage(err) ?? 'No se pudo actualizar el estado';
        this.sweetAlertService.showNotification('Error', msg, 'error');
      },
    });
  }

  toBool(evt: boolean | { checked: boolean }): boolean {
    return typeof evt === 'boolean' ? evt : !!evt?.checked;
  }

  private resolveErrorMessage(err: any): string | undefined {
    if (!err) return undefined;
    if (typeof err === 'string') return err;
    if (typeof err?.message === 'string') return err.message;
    if (typeof err?.error === 'string') return err.error;
    if (typeof err?.error?.detail === 'string') return err.error.detail;
    if (typeof err?.detail === 'string') return err.detail;
    if (typeof err?.title === 'string') return err.title;
    return undefined;
  }

  private loadClauses(): void {
    this.loading = true;
    this.clauseService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const list = (res ?? []).filter((c) => c?.id != null);
          this.clauses = list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        },
        error: () =>
          this.sweetAlertService.showNotification(
            'Error',
            'No se pudieron cargar las cláusulas.',
            'error'
          ),
      });
  }

  private openDialog(clause?: ClauseSelect): void {
    import('../../../../shared/components/forms/form-dialog/form-dialog.component').then(m => {
      const ref = this.dialog.open(m.FormDialogComponent, {
        width: '600px',
        disableClose: true,
        data: {
          entity: clause ?? {},
          formType: 'Clause',
          title: clause ? 'Editar cláusula' : 'Nueva cláusula',
        },
      });

      ref.afterClosed()
        .pipe(
          take(1),
          switchMap((result) => {
            if (!result) return EMPTY;
            const payload = result as ClauseCreate | ClauseUpdate;

            if (clause?.id) {
              const body: ClauseUpdate = {
                ...(payload as ClauseCreate),
                id: clause.id,
                active: clause.active ?? true,
              };
              this.loading = true;
              return this.clauseService.update(body).pipe(finalize(() => (this.loading = false)));
            }

            this.loading = true;
            const body: ClauseCreate = { ...(payload as ClauseCreate), active: true };
            return this.clauseService.create(body).pipe(finalize(() => (this.loading = false)));
          })
        )
        .subscribe({
          next: (res) => {
            if (!res) return;
            if ('id' in res && this.clauses.some(c => c.id === res.id)) {
              this.clauses = this.clauses.map(c => (c.id === res.id ? res : c));
              this.sweetAlertService.showNotification('Éxito', 'Cláusula actualizada', 'success');
            } else if ('id' in res) {
              this.clauses = [res as ClauseSelect, ...this.clauses];
              this.sweetAlertService.showNotification('Éxito', 'Cláusula creada', 'success');
            }
          },
          error: () =>
            this.sweetAlertService.showNotification('Error', 'No se pudo guardar', 'error'),
        });
    });
  }
}
