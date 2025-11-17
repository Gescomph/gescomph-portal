import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs/operators';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';

import { DepartmentStore } from '../../../setting/store/department/department.store';
import { CityService } from '../../../setting/services/city/city.service';

import { RoleSelectModel } from '../../models/role.models';
import { RoleService } from '../../services/role/role.service';

import {
  UserUpdateModel,
  UserSelectModel
} from '../../models/user.models';

import { PersonUpdateModel } from '../../models/person.models';
import { RegisterModel } from '../../../auth-login/models/register.models';
import { ErrorMessageService } from '../../../../shared/services/forms/error-message.service';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';

import { SecurityUserStore } from '../../store/user/user.store';
import { PersonStore } from '../../store/person/person.store';

import { StandardButtonComponent } from '../../../../shared/components/ui/standard-button/standard-button.component';
import { DocumentFormatDirective } from '../../../../shared/directives/document-format/document-format.directive';

import { PersonService } from '../../services/person/person.service';

export interface UserFormDialogData {
  mode: 'create' | 'edit';
  user?: UserSelectModel;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
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
    StandardButtonComponent,
    DocumentFormatDirective
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.css']
})
export class UserFormDialogComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly cityService = inject(CityService);
  private readonly deptStore = inject(DepartmentStore);
  private readonly personService = inject(PersonService);

  private readonly errMsg = inject(ErrorMessageService);

  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);
  private readonly userStore = inject(SecurityUserStore);
  private readonly personStore = inject(PersonStore);
  private readonly alerts = inject(SweetAlertService);

  isInitializing = true;
  isEdit = this.data?.mode === 'edit';
  isLoading = false;

  loadingCities = false;
  loadingRoles = false;

  readonly departments$ = this.deptStore.departments$;

  private _cities$ = new BehaviorSubject<any[]>([]);
  readonly cities$ = this._cities$.asObservable();

  private _initialCityId: number | null = null;

  private _roles$ = new BehaviorSubject<RoleSelectModel[]>([]);
  readonly roles$ = this._roles$.asObservable();

  form: FormGroup = this.fb.group({
    location: this.fb.group({
      departmentId: [null, Validators.required],
      cityId: [{ value: null, disabled: true }, [Validators.required, Validators.min(1)]]
    }),

    person: this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      document: ['', [Validators.maxLength(20)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      address: ['', [Validators.required, Validators.maxLength(100)]]
    }),

    account: this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]]
    }),

    roleId: [null, [Validators.required, Validators.min(1)]],
    active: [true]
  });

  get locationGroup(): FormGroup { return this.form.get('location') as FormGroup; }
  get personGroup(): FormGroup { return this.form.get('person') as FormGroup; }
  get accountGroup(): FormGroup { return this.form.get('account') as FormGroup; }
  get roleIdCtrl(): FormControl { return this.form.get('roleId') as FormControl; }

  compareById = (a: any, b: any) => String(a ?? '') === String(b ?? '');

  ngOnInit(): void {
    this.setupCityCascade();
    this.loadRoles();
    this.patchInitialData();
  }

  private setupCityCascade(): void {
    const deptCtrl = this.locationGroup.get('departmentId')!;
    const cityCtrl = this.locationGroup.get('cityId')!;

    deptCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(depId => {
        cityCtrl.reset({ value: null, disabled: !depId }, { emitEvent: false });
        this._cities$.next([]);
        this.loadingCities = !!depId;
      }),
      switchMap(depId => {
        if (!depId) {
          this.loadingCities = false;
          return of([]);
        }
        return this.cityService.getCitiesByDepartment(depId).pipe(
          catchError(() => of([])),
          finalize(() => this.loadingCities = false)
        );
      })
    ).subscribe(list => {
      this._cities$.next(list);

      if (this._initialCityId !== null) {
        const match = list.find(c => c.id === this._initialCityId);
        if (match) {
          cityCtrl.setValue(this._initialCityId, { emitEvent: false });
        }
        this._initialCityId = null;
      }

      if (!list.length) cityCtrl.setErrors({ required: true });
    });
  }

  private loadRoles(): void {
    this.loadingRoles = true;

    this.roleService.getAll()
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingRoles = false)
      )
      .subscribe(roles => {
        this._roles$.next(roles);

        if (this.isEdit && this.data.user?.roles?.length) {
          const userRolesLower = this.data.user.roles.map(r => r.toLowerCase());
          const match = roles.find(r => userRolesLower.includes(r.name.toLowerCase()));
          if (match) this.roleIdCtrl.setValue(match.id, { emitEvent: false });
        }
      });
  }

  // =====================================================
  //   CARGA DE DATOS AL EDITAR
  // =====================================================
  private patchInitialData(): void {
    if (!this.isEdit || !this.data.user) {
      this.isInitializing = false;
      return;
    }

    const u = this.data.user;

    this.personService.getById(u.personId).subscribe(person => {

      this._initialCityId = u.cityId;

      // RELLENAR PERSON
      this.personGroup.patchValue({
        firstName: person.firstName || '',
        lastName: person.lastName || '',
        document: person.document || '',
        phone: person.phone || '',
        address: person.address || ''
      });

      // RELLENAR UBICACIÓN
      this.locationGroup.patchValue({
        departmentId: u.departmentId
      });

      // EMAIL DESDE PERSON
      this.accountGroup.patchValue({
        email: person.email || ''
      });

      // ROL
      this.form.get('active')!.setValue(u.active);

      this.isInitializing = false;
    });
  }

  fixEmail(): void {
    const emailCtrl = this.accountGroup.get('email')!;
    const value = String(emailCtrl.value ?? '').trim().toLowerCase();

    if (!value.includes('@')) return;

    const [local, dom] = value.split('@');
    if (dom && !dom.includes('.')) {
      emailCtrl.setValue(local + '@' + dom + '.com', { emitEvent: false });
    }
  }

  async submit(): Promise<void> {

    if (this.isInitializing) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const loc = this.locationGroup.value;
    const p = this.personGroup.value;
    const acc = this.accountGroup.value;
    const roleId = Number(this.roleIdCtrl.value);

    // =============== CREAR ================
    if (!this.isEdit) {
      const registerPayload: RegisterModel = {
        email: acc.email.trim(),
        firstName: p.firstName.trim(),
        lastName: p.lastName.trim(),
        document: (p.document ?? '').trim(),
        phone: p.phone.trim(),
        address: p.address.trim(),
        cityId: Number(loc.cityId),
        roleIds: [roleId]
      };

      this.setLoadingState(true);

      try {
        await firstValueFrom(this.userStore.create(registerPayload));
        await this.alerts.success('Usuario creado correctamente.');
        this.dialogRef.close(true);
      } catch (err: unknown) {
        await this.alerts.showApiError(err, 'No se pudo crear el usuario.');
      } finally {
        this.setLoadingState(false);
      }

      return;
    }

    // =============== EDITAR ================
    const u = this.data.user!;

    const personPayload: PersonUpdateModel = {
      id: u.personId,
      firstName: p.firstName.trim(),
      lastName: p.lastName.trim(),
      phone: p.phone.trim(),
      address: p.address.trim(),
      cityId: Number(loc.cityId)
    };

    const userPayload: UserUpdateModel = {
      id: u.id,
      email: acc.email.trim(),
      personId: u.personId,
      roleIds: [roleId]
    };

    this.setLoadingState(true);

    try {
      await firstValueFrom(this.personStore.update(personPayload.id, personPayload));
      await firstValueFrom(this.userStore.updateUser(userPayload.id, userPayload));
      await this.alerts.success('Usuario actualizado correctamente.');
      this.dialogRef.close(true);
    } catch (err: unknown) {
      await this.alerts.showApiError(err, 'No se pudieron actualizar los datos.');
    } finally {
      this.setLoadingState(false);
    }
  }

  private setLoadingState(state: boolean): void {
    this.isLoading = state;
    this.dialogRef.disableClose = state;
  }

  cancel(): void {
    this.setLoadingState(false);
    this.dialogRef.close(null);
  }

  getFirstError(control: AbstractControl | null): string | null {
    return this.errMsg.firstError(control);
  }
}
