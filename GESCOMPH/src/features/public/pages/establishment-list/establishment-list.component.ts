import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { CardComponent } from '../../../../shared/components/ui/card/card.component';
import { EstablishmentService } from '../../../establishments/services/establishment/establishment.service';
import { EstablishmentStore } from '../../../establishments/store/establishment/establishment.store';

import { AbstractControl, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatToolbarModule } from '@angular/material/toolbar';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';
import { AppValidators } from '../../../../shared/utils/app-validators';
import { EstablishmentCard, EstablishmentSelect } from '../../../establishments/models/establishment.models';
import { SquareSelectModel } from '../../../establishments/models/squares.models';
import { SquareService } from '../../../establishments/services/square/square.service';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';


@Component({
  selector: 'app-establishment-list',
  imports: [CommonModule, CardComponent, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './establishment-list.component.html',
  styleUrl: './establishment-list.component.css'
})
export class EstablishmentListComponent implements OnInit {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(EstablishmentStore);
  private readonly estSvc = inject(EstablishmentService);
  private readonly squareSvc = inject(SquareService);
  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();
  readonly items = this.store.items;
  readonly rows = this.store.items;

  plazas: SquareSelectModel[] = [];
  establishments: EstablishmentCard[] = [];
  selectedPlazaId: number | null = null;

  readonly filteredEstablishments = signal<EstablishmentCard[]>([]);

  loadingEstablishments = false;

  async ngOnInit(): Promise<void> {
    await this.store.loadAll({ activeOnly: true });
    this.loadPlazas();
  }

  onView(id: number): void {
    this.estSvc.getById(id).subscribe({
      next: (row) => {
        if (!row) {
          this.sweetAlertService.showNotification('Error', 'Establecimiento no encontrado', 'error');
          return;
        }

        import('../../../establishments/components/establishment/establishment-detail-dialog/establishment-detail-dialog.component')
          .then((m) => {
            const dialogRef = this.dialog.open(m.EstablishmentDetailDialogComponent, {
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
                this.sweetAlertService.showNotification('Error', 'Error al abrir formulario de cita', 'error');
              }
            });
          })
          .catch(() => {
            this.sweetAlertService.showNotification('Error', 'Error al cargar el establecimiento', 'error');
          });
      },
      error: () => this.sweetAlertService.showNotification('Error', 'Establecimiento no encontrado', 'error')
    });
  }

  onCreateAppointment(id: number): void {
    this.estSvc.getById(id).subscribe({
      next: (row) => {
        if (!row) {
          this.sweetAlertService.showNotification('Error', 'Establecimiento no encontrado', 'error');
          return;
        }

        this.openAppointmentDialog(row).catch(() => {
          this.sweetAlertService.showNotification('Error', 'Error al abrir formulario de cita', 'error');
        });
      },
      error: () => this.sweetAlertService.showNotification('Error', 'Establecimiento no encontrado', 'error')
    });
  }



  goHome(): void {
    this.router.navigate(['/']);
  }

  // LOGICA DEL FILTRO

  readonly filterKey = signal<string>('');


  readonly filtered = computed<readonly EstablishmentCard[]>(() => {

    const baseList = (this.selectedPlazaId && this.selectedPlazaId !== 0)
      ? this.filteredEstablishments()
      : this.rows() ?? [];


    let result = [...baseList];

    const q = this.filterKey().trim().toLowerCase();
    if (q) {
      result = result.filter(it =>
        it.name?.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q) ||
        it.address?.toLowerCase().includes(q) ||
        it.rentValueBase?.toString().includes(q)
      );
    }

    const area = this.generalGroup.controls.areaM2.value;
    if (area && area > 0) {
      result = result.filter(it => (it.areaM2 ?? 0) >= area);
    }

    return result;
  });



  onFilterChange(v: string): void {
    this.filterKey.set(v || '');
  }


  // PLAZAS, LOGICA QUE SE ENCARGA DE CARGAR LOS ESTABLECIMIENTOS DEPENDIENDO DE LA PLAZA SELECCIONADA

  private loadPlazas(): void {
    this.squareSvc.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.plazas = res ?? [])
      });
  }

  onPlazaChange(plazaId: number | null): void {
    this.selectedPlazaId = plazaId;

    if (!plazaId || plazaId === 0) {
      this.filteredEstablishments.set(this.rows() ?? []);
      this.store.loadAll({ activeOnly: true }); // carga todos los que ya están en el store
      return;
    }

    this.loadingEstablishments = true;
    this.store.clear();

    this.estSvc.getByPlaza(plazaId, { activeOnly: true }).pipe(
      takeUntil(this.destroy$),
      catchError(() => of([])),
      finalize(() => {
        this.loadingEstablishments = false;
      })
    ).subscribe((list) => {
      this.filteredEstablishments.set(list ?? []);
    });
  }

  // VALIDACIONES AREA M2

  readonly generalGroup = this.fb.group({
    areaM2: this.fb.control(0, {
      validators: [
        Validators.required,
        AppValidators.numberRange({ min: 1, max: 1_000_000 }),
        AppValidators.decimal({ decimals: 2 })
      ]
    }),
  }, { updateOn: 'change' });


  onNumberBlur(control: AbstractControl | null) {
    if (!control) return;
    const v = control.value;
    if (v === null || v === undefined || v === '') return;
    const s = String(v).replace(',', '.');
    const n = Number(s);
    if (!Number.isNaN(n)) control.setValue(n, { emitEvent: false });
    control.updateValueAndValidity({ emitEvent: false });
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
