import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { finalize, switchMap, take, tap } from 'rxjs/operators';

import { ContractSelectModel } from '../../models/contract.models';
import { ContractService } from '../../services/contract/contract.service';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';
import { StandardButtonComponent } from '../../../../shared/components/ui/standard-button/standard-button.component';
import { ToggleButtonComponent } from '../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { ContractsRealtimeService } from '../../services/contract/contracts-realtime.service';
import { ContractStore } from '../../store/contract.store';

@Component({
  selector: 'app-contracts-list',
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    ToggleButtonComponent,
    HasRoleAndPermissionDirective,
    StandardButtonComponent,
    MoneyPipe,
  ],
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.css'],
})
export class ContractsListComponent implements OnInit, OnDestroy {
  private readonly store = inject(ContractStore);
  private readonly svc = inject(ContractService);
  private readonly dialog = inject(MatDialog);
  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly pageHeader = inject(PageHeaderService);
  private readonly realtime = inject(ContractsRealtimeService);

  readonly rows = this.store.items;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly filterKey = signal<string>('');

  readonly filtered = computed<readonly ContractSelectModel[]>(() => {
    const list = this.rows() ?? [];
    const q = this.filterKey().trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (it) =>
        it.fullName?.toLowerCase().includes(q) ||
        it.document?.toLowerCase().includes(q) ||
        it.phone?.toLowerCase().includes(q) ||
        (it.email || '').toLowerCase().includes(q)
    );
  });

  readonly totalCount = computed(() => this.rows()?.length ?? 0);
  readonly activeCount = computed(() => this.rows()?.filter((x) => x.active).length ?? 0);
  readonly inactiveCount = computed(() => this.rows()?.filter((x) => !x.active).length ?? 0);

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly pagedFiltered = computed(() => {
    const list = this.filtered() ?? [];
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  isDownloadingPdf = false;

  async ngOnInit(): Promise<void> {
    this.pageHeader.setPageHeader('Contratos', 'Gestión de Contratos');
    this.realtime.start();
    await this.store.loadAll({ force: true });
  }

  ngOnDestroy(): void {
    this.realtime.stop();
  }

  onFilterChange(v: string): void {
    this.filterKey.set(v || '');
    this.pageIndex.set(0);
  }

  onCreate(): void {
    import('../../components/form-contract/form-contract.component').then((m) => {
      const ref = this.dialog.open(m.FormContractComponent, {
        width: '800px',
        disableClose: true,
        autoFocus: true,
        data: null,
      });

      ref.afterClosed().pipe(take(1)).subscribe(async (created: boolean) => {
        if (!created) return;
        this.sweetAlertService.showNotification(
          'Éxito',
          'Contrato creado correctamente.',
          'success'
        );
        await this.store.loadAll({ force: true });
        this.pageIndex.set(0);
      });
    });
  }

  onView(row: ContractSelectModel): void {
    import('../../components/contract-detail-dialog/contract-detail-dialog.component').then(
      (m) => {
        this.dialog.open(m.ContractDetailDialogComponent, {
          width: '900px',
          maxWidth: '95vw',
          data: { id: row.id },
          autoFocus: false,
          disableClose: false,
        });
      }
    );
  }

  onDownload(row: ContractSelectModel): void {
    if (this.isDownloadingPdf) {
      this.sweetAlertService.showNotification(
        'Información',
        'Ya hay una descarga en curso.',
        'info'
      );
      return;
    }
    this.isDownloadingPdf = true;

    const fileName$ = of(`Contrato_${row.fullName || row.id}.pdf`);
    this.svc
      .downloadContractPdf(row.id)
      .pipe(
        take(1),
        switchMap((blob) =>
          fileName$.pipe(
            take(1),
            tap((fileName: string) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            })
          )
        ),
        finalize(() => (this.isDownloadingPdf = false))
      )
      .subscribe({
        next: () =>
          this.sweetAlertService.showNotification(
            'Éxito',
            'La descarga del contrato ha comenzado.',
            'success'
          ),
        error: (err) => {
          console.error('Error downloading PDF:', err);
          this.sweetAlertService.showApiError(err, 'No se pudo descargar el contrato.');
        },
      });
  }

  async onToggleActive(row: ContractSelectModel, e: { checked: boolean } | boolean): Promise<void> {
    const next = typeof e === 'boolean' ? e : !!e?.checked;
    try {
      await this.store.changeActiveStatusRemote(row.id, next);
      this.sweetAlertService.showNotification(
        'Éxito',
        `Contrato ${next ? 'activado' : 'desactivado'} correctamente.`,
        'success'
      );
    } catch (err: any) {
      this.sweetAlertService.showApiError(err, 'No se pudo cambiar el estado.');
    }
  }

  async onDelete(row: ContractSelectModel): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      'Eliminar contrato',
      `¿Deseas eliminar el contrato de "${row.fullName}"?`,
      'Eliminar',
      'Cancelar'
    );
    if (!result.isConfirmed) return;

    try {
      await this.store.delete(row.id);
      this.sweetAlertService.showNotification(
        'Eliminación Exitosa',
        'Contrato eliminado correctamente.',
        'success'
      );
      this.pageIndex.set(0);
    } catch (err) {
      this.sweetAlertService.showApiError(err, 'No se pudo eliminar el contrato.');
    }
  }

  trackById = (_: number, item: ContractSelectModel) => item.id;

  private readonly errorToast = effect(() => {
    const err = this.error?.();
    if (err) {
      this.sweetAlertService.showApiError(err, 'No se pudieron cargar los contratos.');
    }
  });
}
