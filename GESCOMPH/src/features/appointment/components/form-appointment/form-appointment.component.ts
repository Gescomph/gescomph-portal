import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { StandardButtonComponent } from '../../../../shared/components/ui/standard-button/standard-button.component';

import { of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PersonService } from '../../../security/services/person/person.service';
import { CityService } from '../../../setting/services/city/city.service';
import { AppointmentService } from '../../services/appointment/appointment.service';

import { AppValidators as AV } from '../../../../shared/utils/app-validators';
import { EstablishmentSelect } from '../../../establishments/models/establishment.models';
import { CitySelectModel } from '../../../setting/models/city.models';
import { AppointmentCreateModel } from '../../models/appointment.models';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorMessageService } from '../../../../shared/services/forms/error-message.service';
import { FormUtilsService, buildEmailValidators } from '../../../../shared/services/forms/form-utils.service';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';

@Component({
  selector: 'app-form-appointment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    StandardButtonComponent
  ],
  templateUrl: './form-appointment.component.html',
  styleUrls: ['./form-appointment.component.css']
})
export class FormAppointmentComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly citySvc = inject(CityService);
  private readonly personSvc = inject(PersonService);
  private readonly appointmentSvc = inject(AppointmentService);
  private readonly dialogRef = inject(MatDialogRef<FormAppointmentComponent>);

  private readonly utils = inject(FormUtilsService);
  private readonly errMsg = inject(ErrorMessageService);
  private readonly sweetAlertService = inject(SweetAlertService);

  private readonly destroy$ = new Subject<void>();

  personFormGroup!: FormGroup;
  appointmentFormGroup!: FormGroup;
  establishmentFormGroup!: FormGroup;

  ciudades: CitySelectModel[] = [];
  establishment: EstablishmentSelect | null = null;
  filteredEstablishments: EstablishmentSelect[] = [];

  personaEncontrada = false;
  personId: number | null = null;
  foundCityName: string | null = null;

  loadingPerson = false;
  loadingEstablishments = false;
  saving = false;

  // Selección de horarios
  timeSlots = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  availableTimes: string[] = [];
  selectedTime = '';

  today = new Date();

  private lastQueriedDoc: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadCiudades();
    this.setupReactivePersonLookup();
    this.setupRequestDateChangeListener();

    if (this.data) {
      this.appointmentFormGroup.patchValue({
        establishmentId: this.data.id,
        establishmentName: this.data.name       // para mostrar en input
      });
    }

    const initialDate = this.appointmentFormGroup.get('requestDate')?.value;
    if (initialDate) {
      this.fetchAvailableTimes(initialDate);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ===================== Forms ===================== */
  private initForms(): void {
    this.personFormGroup = this.fb.group({
      document: this.fb.control('', { validators: [Validators.required, AV.colombianDocument()], updateOn: 'blur' }),
      firstName: ['', [Validators.required, AV.notOnlySpaces(), AV.alphaHumanName(), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, AV.notOnlySpaces(), AV.alphaHumanName(), Validators.maxLength(50)]],
      phone: ['', [Validators.required, AV.colombianPhone()]],
      email: ['', buildEmailValidators(true)],
      address: ['', Validators.required]
    });

    this.appointmentFormGroup = this.fb.group({
      description: ['', Validators.required],
      requestDate: [this.today, Validators.required],
      cityId: [null, Validators.required],
      establishmentId: [null, Validators.required],
      establishmentName: [null, Validators.required]
    });
  }

  /* ===================== Loads ===================== */
  private loadCiudades(): void {
    this.citySvc.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.ciudades = res ?? []),
        error: (err) => console.error('Error al cargar ciudades', err)
      });
  }

  /* ===================== Lookup persona ===================== */
  private setupReactivePersonLookup(): void {
    this.personFormGroup.get('document')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        map(v => String(v ?? '').trim()),
        distinctUntilChanged(),
        tap(doc => {
          if (!doc || doc.length < 5) {
            this.resetFoundPersonState();
            this.enablePersonFields();
          }
        }),
        switchMap(doc => {
          if (!doc || doc.length < 5) return of(null);
          this.loadingPerson = true;
          this.lastQueriedDoc = doc;
          return this.personSvc.getByDocument(doc).pipe(
            catchError(err => {
              if (err?.status === 404) {
                this.sweetAlertService.showApiError(err, 'No encontrado', 'No encontrado');
              }
              return of(null);
            }),
            finalize(() => (this.loadingPerson = false))
          );
        })
      )
      .subscribe(person => {
        const currentDoc = String(this.personFormGroup.get('document')!.value ?? '').trim();
        if (this.lastQueriedDoc && currentDoc !== this.lastQueriedDoc) return;

        if (person) {
          this.personaEncontrada = true;
          this.personId = Number(person.id ?? null);
          this.foundCityName = person.cityName ?? null;
          this.patchPerson(person);
          this.disablePersonFields();
        } else {
          this.resetFoundPersonState();
          this.enablePersonFields();
        }
      });
  }

  private patchPerson(p: any): void {
    this.personFormGroup.patchValue(
      {
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
        phone: p.phone ?? '',
        email: p.email ?? '',
        address: p.address ?? ''
      },
      { emitEvent: false }
    );

    this.appointmentFormGroup.patchValue(
      {
        cityId: p.cityId ?? null,
        establishmentId: this.data.id,
        establishmentName: this.data.name
      },
      { emitEvent: false }
    );
  }

  private resetFoundPersonState(): void {
    this.personaEncontrada = false;
    this.personId = null;
    this.foundCityName = null;
    this.personFormGroup.patchValue({ firstName: '', lastName: '', phone: '', email: '', address: '' }, { emitEvent: false });
    this.appointmentFormGroup.patchValue({ cityId: null }, { emitEvent: false });
  }

  private disablePersonFields(): void {
    ['firstName', 'lastName', 'phone', 'email', 'address'].forEach(k => this.personFormGroup.get(k)?.disable({ emitEvent: false }));
    ['cityId'].forEach(k => this.appointmentFormGroup.get(k)?.disable({ emitEvent: false }));
  }

  private enablePersonFields(): void {
    ['firstName', 'lastName', 'phone', 'email', 'address'].forEach(k => this.personFormGroup.get(k)?.enable({ emitEvent: false }));
    ['cityId'].forEach(k => this.appointmentFormGroup.get(k)?.enable({ emitEvent: false }));
  }

  /* ===================== Horarios ===================== */
  private setupRequestDateChangeListener(): void {
    this.appointmentFormGroup.get('requestDate')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged()
      )
      .subscribe(date => {
        if (date) {
          this.selectedTime = '';
          this.fetchAvailableTimes(date);
        } else {
          this.availableTimes = [];
          this.selectedTime = '';
        }
      });
  }

  private fetchAvailableTimes(selectedDate: Date): void {
    const dateString = this.formatDate(selectedDate);
    this.appointmentSvc.getByDate(dateString)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error al obtener citas:', err);
          this.availableTimes = [...this.timeSlots];
          return of([]);
        })
      )
      .subscribe(appointments => {
        if (!appointments || appointments.length === 0) {
          this.availableTimes = [...this.timeSlots];
          return;
        }

        const establishmentAppointments = appointments.filter(
          app => app.establishmentId === this.data.id
        );

        const occupiedTimes = establishmentAppointments
          .filter(app => !!app.dateTimeAssigned)
          .map(app => {
            const date = new Date(app.dateTimeAssigned!);
            return this.formatTime(date);
          });

        this.availableTimes = this.timeSlots.filter(
          slot => !occupiedTimes.includes(slot)
        );
      });
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateForApi(date: Date): string {
    return `${this.formatDate(date)}T00:00:00`;
  }

  private formatDateTimeForApi(date: Date, time: string): string {
    return `${this.formatDate(date)}T${time}:00`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /* ===================== Acciones ===================== */
  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    const p = this.personFormGroup;
    const a = this.appointmentFormGroup;

    this.utils.normalizeWhitespace(p.get('firstName'));
    this.utils.normalizeWhitespace(p.get('lastName'));
    this.utils.normalizeWhitespace(p.get('document'));
    this.utils.normalizeWhitespace(p.get('phone'));
    this.utils.coerceEmailTld(p.get('email'));

    if (p.invalid || a.invalid || this.saving) {
      p.markAllAsTouched();
      a.markAllAsTouched();
      return;
    }

    const payload: AppointmentCreateModel = {
      firstName: String(p.get('firstName')!.value).trim(),
      lastName: String(p.get('lastName')!.value).trim(),
      document: String(p.get('document')!.value).trim(),
      address: String(p.get('address')?.value ?? '').trim(),
      phone: String(p.get('phone')!.value).trim(),
      email: String(p.get('email')!.value).trim(),
      cityId: Number(a.get('cityId')!.value),
      establishmentId: Number(a.get('establishmentId')!.value),
      description: String(a.get('description')!.value).trim(),
      requestDate: this.formatDateForApi(a.get('requestDate')!.value),
      dateTimeAssigned: this.buildDateTimeAssigned(),
      active: true
    };


    this.saving = true;
    this.appointmentSvc.create(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: err => console.error(' Error al crear cita', err)
      });
  }

  fixEmail(): void {
    this.utils.coerceEmailTld(this.personFormGroup.get('email'));
  }

  private buildDateTimeAssigned(): string | null {
    const requestDate = this.appointmentFormGroup.get('requestDate')!.value as Date;
    if (!requestDate || !this.selectedTime) return null;
    // Enviamos hora local sin zona para que el backend no aplique corrimientos a UTC
    return this.formatDateTimeForApi(requestDate, this.selectedTime);
  }

  /**
   * Marca todos los campos como tocados y actualiza su validez.
   * Forza la visualización de errores de validación.
   */
  markAllTouched(): void {
    [this.personFormGroup, this.appointmentFormGroup, this.establishmentFormGroup].forEach(g => {
      g.markAllAsTouched();
      Object.values(g.controls).forEach(c => c.updateValueAndValidity());
    });
  }

  getFirstError(control: AbstractControl | null, order: string[] = []): string | null {
    return this.errMsg.firstError(control, order);
  }
}
