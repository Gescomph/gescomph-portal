import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

import { StandardButtonComponent } from '../../../../shared/components/ui/standard-button/standard-button.component';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { ContractSelectModel } from '../../models/contract.models';
import { MonthlyObligation, ObligationStatus } from '../../models/obligation-month.models';
import { ContractService } from '../../services/contract/contract.service';
import { ContractStore } from '../../store/contract.store';
import { ButtonPayComponent } from '../../../../shared/components/ui/button-pay/button-pay.component';
import { ObligationRealtimeService } from '../../services/obligation-realtime.service';

@Component({
  selector: 'app-contract-detail-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    StandardButtonComponent,
    MoneyPipe,
    ButtonPayComponent
  ],
  templateUrl: './contract-detail-dialog.component.html',
  styleUrls: [
    './contract-detail-dialog.component.css',
    './contract-detail-dialog.component-additions.css'
  ],
})
export class ContractDetailDialogComponent implements OnInit, OnDestroy {
  private readonly svc = inject(ContractService);
  private readonly store = inject(ContractStore);
  private readonly realtimeSvc = inject(ObligationRealtimeService);
  private sub?: Subscription;

  contract: ContractSelectModel | null = null;
  obligations: MonthlyObligation[] = [];
  selectedObligation?: MonthlyObligation;
  loading = false;
  error: string | null = null;

  // Mejor performance en *ngFor
  trackByObligationId = (_: number, item: MonthlyObligation) => item.id;

  constructor(
    private readonly dialogRef: MatDialogRef<ContractDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.setupRealtime();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.realtimeSvc.stopConnection();
  }

  private setupRealtime(): void {
    this.realtimeSvc.startConnection();
    this.sub = this.realtimeSvc.obligationsUpdated$.subscribe(() => {
      console.log('Refrescando obligaciones por evento real-time...');
      this.loadData(true);
    });
  }

  private loadData(isRefresh = false): void {
    if (!isRefresh) this.loading = true;
    this.error = null;

    const id = this.data?.id;
    if (!id) {
      this.error = 'ID de contrato no proporcionado';
      this.loading = false;
      return;
    }

    forkJoin({
      contract: this.svc.getById(id).pipe(take(1)),
      obligations: this.svc.getMonthlyObligations(id).pipe(take(1)),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ contract, obligations }) => {
          // Sincroniza estado activo con la grilla si hubiese cambio reciente
          const current = this.store.getById(contract.id);
          this.contract = current ? { ...contract, active: current.active } : contract;
          this.obligations = (obligations || []).sort((a, b) => {
            // sort por año desc y mes desc
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          });
          this.selectedObligation = this.pickPreferredObligation(this.obligations);
        },
        error: (err) => {
          console.error('Error loading contract detail:', err);
          this.error = 'No se pudo cargar el detalle del contrato.';
        },
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Determina si una obligación puede ser pagada.
   * Una obligación puede pagarse solo si:
   * - Status es: Pendiente (1), Vencida (6), PreJuridico (8) o Juridico (9)
   * - No está bloqueada (locked !== true)
   */
  canPayObligation(obligation: MonthlyObligation): boolean {
    const payableStatuses: string[] = [
      ObligationStatus.Pendiente,
      ObligationStatus.Vencida,
      ObligationStatus.PreJuridico,
      ObligationStatus.Juridico
    ];

    const canPay = payableStatuses.includes(obligation.status) && !obligation.locked;

    // Debug: descomentar para ver qué pasa
    console.log('canPayObligation:', {
      obligationId: obligation.id,
      status: obligation.status,
      locked: obligation.locked,
      canPay,
      payableStatuses
    });

    return canPay;
  }

  private pickPreferredObligation(list: MonthlyObligation[]): MonthlyObligation | undefined {
    if (!list?.length) return undefined;

    const prioritized = list.find((item) =>
      item.status === ObligationStatus.Pendiente ||
      item.status === ObligationStatus.Vencida
    );
    return prioritized ?? list[0];
  }

  getTotal(o: MonthlyObligation): number {
    return o.totalAmount + (o.lateAmount || 0);
  }
}
