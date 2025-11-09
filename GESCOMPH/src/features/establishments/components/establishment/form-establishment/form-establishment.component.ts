import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component, Inject,
  OnDestroy,
  OnInit,
  Optional,
  inject
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder, ReactiveFormsModule, Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';

import {
  EstablishmentCreate,
  EstablishmentSelect,
  EstablishmentUpdate,
} from '../../../models/establishment.models';
import { SquareSelectModel } from '../../../models/squares.models';
import { EstablishmentService } from '../../../services/establishment/establishment.service';
import { EstablishmentStore } from '../../../store/establishment/establishment.store';
import { ImageService } from '../../../services/image/image.service';
import { SquareService } from '../../../services/square/square.service';

import { FileDropDirective } from '../../../../../shared/directives/file-drop.directive';
import { GeneralForm, UbicacionForm } from '../../../shapes/form';

import { FormErrorComponent } from '../../../../../shared/components/forms/form-error/form-error.component';
import { StandardButtonComponent } from '../../../../../shared/components/ui/standard-button/standard-button.component';
import { AppValidators } from '../../../../../shared/utils/app-validators';
import { FilePickerService } from '../../../../../shared/services/picker/file-picker.service';
import { SweetAlertService } from '../../../../../shared/utils/notifications/sweet-alert.service';
import { ImageModel } from '../../../models/images.models';
import { ImageManagerComponent } from '../../shared/image-manager/image-manager.component';


export const ERRORS = {
  name: {
    required: 'El nombre es obligatorio.',
    maxlength: 'El nombre no puede superar 100 caracteres.',
    onlySpaces: 'El nombre no puede ser solo espacios.'
  },
  description: {
    required: 'La descripción es obligatoria.',
    maxlength: 'La descripción no puede superar 500 caracteres.',
    onlySpaces: 'La descripción no puede ser solo espacios.'
  },
  uvtQty: {
    required: 'La cantidad de UVT es obligatoria.',
    NaN: 'Ingresa un número válido.',
    invalidNotation: 'No uses notación científica (e/E) ni signos +/−.',
    min: 'La cantidad UVT no puede ser menor que 1.',
    max: 'La cantidad UVT es demasiado alta.',
    decimalScale: 'Máximo 2 decimales permitidos.'
  },
  areaM2: {
    required: 'El área es obligatoria.',
    NaN: 'Ingresa un número válido.',
    invalidNotation: 'No uses notación científica (e/E) ni signos +/−.',
    min: 'El área no puede ser menor que 1 m².',
    max: 'El área es demasiado alta.',
    decimalScale: 'Máximo 2 decimales permitidos.'
  },
  plazaId: {
    required: 'La plaza es obligatoria.'
  },
  address: {
    maxlength: 'La dirección no puede superar 150 caracteres.',
    addressInvalid: 'Usa solo letras, números, espacios y # - , .'
  }
} as const;


@Component({
  selector: 'app-form-establishment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatStepperModule,
    StandardButtonComponent,
    FormErrorComponent,
    ImageManagerComponent
  ],
  templateUrl: './form-establishment.component.html',
  styleUrls: ['./form-establishment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormEstablishmentComponent implements OnInit, OnDestroy {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(EstablishmentStore);
  private readonly estSvc = inject(EstablishmentService);
  private readonly imageService = inject(ImageService);
  private readonly plazasSrv = inject(SquareService);
  private readonly dialogRef = inject(MatDialogRef<FormEstablishmentComponent, boolean>);
  private readonly sweetAlertService = inject(SweetAlertService);
  private readonly dialog = inject(MatDialog);
  private readonly filePicker = inject(FilePickerService);

  isEdit = false;
  private _isBusy = false;
  get isBusy(): boolean { return this._isBusy; }
  set isBusy(v: boolean) {
    this._isBusy = v;
    const opts = { emitEvent: false } as const;
    if (v) {
      this.generalGroup.disable(opts);
      this.ubicacionGroup.disable(opts);
    } else {
      this.generalGroup.enable(opts);
      this.ubicacionGroup.enable(opts);
    }
  }
  isDeletingImage = false;

  readonly generalGroup = this.fb.group<GeneralForm>({
    name: this.fb.control('', {
      validators: [
        Validators.minLength(3),
        Validators.required,
        Validators.maxLength(100),
        AppValidators.notOnlySpaces()
      ]
    }),
    description: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.maxLength(500),
        AppValidators.notOnlySpaces()
      ]
    }),
    uvtQty: this.fb.control(0, {
      validators: [
        Validators.required,
        AppValidators.numberRange({ min: 1, max: 9999 }),
        AppValidators.decimal({ decimals: 2 })
      ]
    }),
    areaM2: this.fb.control(0, {
      validators: [
        Validators.required,
        AppValidators.numberRange({ min: 1, max: 1_000_000 }),
        AppValidators.decimal({ decimals: 2 })
      ]
    }),
  }, { updateOn: 'change' });

  readonly ubicacionGroup = this.fb.group<UbicacionForm>({
    plazaId: this.fb.control(0, { validators: [Validators.required] }),
    address: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.maxLength(150),
        AppValidators.address(),
        AppValidators.notOnlySpaces()
      ]
    }),
  }, { updateOn: 'change' });


  readonly MAX_IMAGES = 5;
  readonly MAX_FILE_SIZE_MB = 5;
  readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_MB * 1024 * 1024;

  readonly selectedFiles: File[] = [];
  readonly imagesPreview: string[] = [];
  private objectUrls: string[] = [];
  readonly existingImagesFull: ImageModel[] = [];

  Squares: SquareSelectModel[] = [];

  readonly errors = ERRORS;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data?: EstablishmentSelect) {
    this.isEdit = !!data?.id;
  }

  async ngOnInit(): Promise<void> {
    if (this.isEdit) this.patchValues();
    this.Squares = await firstValueFrom(this.plazasSrv.getAll());
  }

  ngOnDestroy(): void {
    this.filePicker.revokeAll(this.objectUrls);
    this.objectUrls = [];
  }

  private patchValues(): void {
    if (!this.data) return;
    this.generalGroup.patchValue({
      name: this.data.name,
      description: this.data.description,
      areaM2: this.data.areaM2,
      uvtQty: this.data.uvtQty,
    });
    this.ubicacionGroup.patchValue({
      plazaId: this.data.plazaId,
      address: this.data.address ?? '',
    });
    this.existingImagesFull.push(...(this.data.images ?? []));
  }

  onTrim(control: AbstractControl | null) {
    if (!control) return;
    const v = (control.value ?? '') as string;
    const trimmed = v.trim().replace(/\s+/g, ' ');
    if (trimmed !== v) control.setValue(trimmed);
  }

  onNumberBlur(control: AbstractControl | null) {
    if (!control) return;
    const v = control.value;
    if (v === null || v === undefined || v === '') return;
    const s = String(v).replace(',', '.');
    const n = Number(s);
    if (!Number.isNaN(n)) control.setValue(n, { emitEvent: false });
    control.updateValueAndValidity({ emitEvent: false });
  }

  onFilesAdded(files: File[]) {
    const remaining = this.MAX_IMAGES - (this.selectedFiles.length + this.existingImagesFull.length);
    if (remaining <= 0) {
      this.sweetAlertService.showNotification('Límite de imágenes', `Máx ${this.MAX_IMAGES} imágenes`, 'warning');
      return;
    }

    const { accepted, errors, objectUrls } = this.filePicker.pick(
      files,
      this.selectedFiles,
      { remaining, maxSizeBytes: this.MAX_FILE_SIZE_BYTES, acceptImagesOnly: true }
    );

    if (errors.length) this.sweetAlertService.showNotification('Error en archivos', errors.join('\n'), 'error');

    this.imagesPreview.push(...objectUrls);
    this.objectUrls.push(...objectUrls);
    this.selectedFiles.push(...accepted);
  }

  handleFileInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    const arr: File[] = [];
    for (let i = 0; i < input.files.length; i++) {
      const f = input.files.item(i);
      if (f) arr.push(f);
    }
    this.onFilesAdded(arr);
  }

  async removeImage(index: number, isExisting: boolean) {
    if (this.isDeletingImage) return;

    if (isExisting) {
      const image = this.existingImagesFull[index];
      this.isDeletingImage = true;
      try {
        await firstValueFrom(this.imageService.deleteById(image.id));
        this.existingImagesFull.splice(index, 1);
      } finally {
        this.isDeletingImage = false;
      }
    } else {
      const url = this.imagesPreview[index];
      if (url) {
        this.filePicker.revoke(url);
        this.objectUrls = this.objectUrls.filter(u => u !== url);
      }
      this.imagesPreview.splice(index, 1);
      this.selectedFiles.splice(index, 1);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isBusy) return;

    if (this.generalGroup.invalid || this.ubicacionGroup.invalid) {
      this.generalGroup.markAllAsTouched();
      this.ubicacionGroup.markAllAsTouched();
      this.sweetAlertService.showNotification('Campos incompletos', 'Completa todos los campos requeridos', 'warning');
      return;
    }

    this.isBusy = true;
    this.dialogRef.disableClose = true;

    try {
      const dto = this.buildDto();
      const establishmentId = await this.createOrUpdateAndReturnId(dto);
      await this.uploadNewImagesIfAny(establishmentId);
      this.dialogRef.close(true);
    } catch (err: any) {
      this.sweetAlertService.showApiError(err, 'No se pudo guardar el establecimiento.');
    } finally {
      this.isBusy = false;
      this.dialogRef.disableClose = false;
    }
  }

  private buildDto() {
    const base = this.generalGroup.getRawValue();
    const loc = this.ubicacionGroup.getRawValue();
    return {
      name: base.name,
      description: base.description,
      areaM2: base.areaM2,
      uvtQty: base.uvtQty,
      plazaId: loc.plazaId,
      address: loc.address
    };
  }

  private async createOrUpdateAndReturnId(dto: EstablishmentCreate | EstablishmentUpdate): Promise<number> {
    if (this.isEdit && this.data) {
      await this.store.update({ id: this.data.id, ...dto } as EstablishmentUpdate);
      return this.data.id;
    } else {
      const created = await firstValueFrom(this.estSvc.create(dto as EstablishmentCreate));
      this.store.upsertOne(created);
      return created.id;
    }
  }

  /** ***AQUÍ el cambio importante polimórfico*** */
  private async uploadNewImagesIfAny(establishmentId: number): Promise<void> {
    if (!this.selectedFiles.length) return;

    const uploaded = await firstValueFrom(
      this.imageService.uploadImages("Establishment", establishmentId, this.selectedFiles)
    );

    if (uploaded?.length) {
      this.existingImagesFull.push(...uploaded);
      this.store.applyImages(establishmentId, uploaded);
    }
  }

  cancel(): void { this.dialogRef.close(false); }

  imgSrc(img: any): string {
    return img?.filePath ?? img?.FilePath ?? '';
  }

  private getAllPreviewSources(): string[] {
    const existing = (this.existingImagesFull ?? []).map((img) => this.imgSrc(img)).filter(Boolean);
    return [...existing, ...(this.imagesPreview ?? [])];
  }

  private openPreview(title: string, startIndex: number): void {
    import('../image-preview-dialog/image-preview-dialog-component.component').then(m => {
      this.dialog.open(m.ImagePreviewDialogComponent, {
        data: { title, imageList: this.getAllPreviewSources(), startIndex },
        panelClass: 'image-preview-dialog',
        maxWidth: '95vw',
        width: 'auto',
        autoFocus: false
      });
    });
  }

  openPreviewFromExisting(index: number): void {
    if (index < 0 || index >= this.existingImagesFull.length) return;
    this.openPreview(`Imagen existente (${index + 1})`, index);
  }

  openPreviewFromNew(index: number): void {
    if (index < 0 || index >= this.imagesPreview.length) return;
    const offsetExisting = this.existingImagesFull?.length ?? 0;
    this.openPreview(`Imagen nueva (${index + 1})`, offsetExisting + index);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
