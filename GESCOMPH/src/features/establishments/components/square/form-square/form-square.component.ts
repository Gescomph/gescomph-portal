import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  inject,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';

import { FormErrorComponent } from '../../../../../shared/components/forms/form-error/form-error.component';
import { StandardButtonComponent } from '../../../../../shared/components/ui/standard-button/standard-button.component';
import { AppValidators } from '../../../../../shared/utils/app-validators';
import { SweetAlertService } from '../../../../../shared/utils/notifications/sweet-alert.service';
import { FilePickerService } from '../../../../../shared/services/picker/file-picker.service';

import { ImageModel } from '../../../models/images.models';
import { SquareSelectModel, SquareCreateModel, SquareUpdateModel } from '../../../models/squares.models';
import { ImageService } from '../../../services/image/image.service';
import { SquareService } from '../../../services/square/square.service';
import { ImageManagerComponent } from '../../shared/image-manager/image-manager.component';


@Component({
  standalone: true,
  selector: 'app-form-square',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    StandardButtonComponent,
    FormErrorComponent,
    ImageManagerComponent
  ],
  templateUrl: './form-square.component.html',
  styleUrls: ['./form-square.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSquareComponent implements OnInit, OnDestroy {

  private readonly fb = inject(NonNullableFormBuilder);
  public readonly dialogRef = inject(MatDialogRef<FormSquareComponent, boolean>);
  private readonly sweet = inject(SweetAlertService);
  private readonly sqSvc = inject(SquareService);
  private readonly imgSvc = inject(ImageService);
  private readonly filePicker = inject(FilePickerService);

  isEdit = false;
  readonly MAX_IMAGES = 5;
  readonly MAX_FILE_SIZE_MB = 5;
  readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_MB * 1024 * 1024;

  selectedFiles: File[] = [];
  previews: string[] = [];
  existingImages: ImageModel[] = [];
  private objectUrls: string[] = [];
  isBusy = false;

  readonly generalGroup = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(100), AppValidators.notOnlySpaces()]),
    description: this.fb.control('', [Validators.required, Validators.maxLength(500), AppValidators.notOnlySpaces()]),
    location: this.fb.control('', [Validators.required, Validators.maxLength(200), AppValidators.notOnlySpaces()]),
  });

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data?: SquareSelectModel) {
    this.isEdit = !!data?.id;
  }

  ngOnInit(): void {
    if (this.isEdit && this.data) {
      this.generalGroup.patchValue({
        name: this.data.name,
        description: this.data.description,
        location: this.data.location
      });
      this.existingImages.push(...this.data.images ?? []);
    }
  }

  ngOnDestroy(): void {
    this.filePicker.revokeAll(this.objectUrls);
  }

  onFilesAdded(files: File[]) {
    const remaining = this.MAX_IMAGES - (this.selectedFiles.length + this.existingImages.length);
    if (remaining <= 0) {
      this.sweet.showNotification('Límite de imágenes', `Máximo ${this.MAX_IMAGES} imágenes`, 'warning');
      return;
    }

    const { accepted, errors, objectUrls } = this.filePicker.pick(
      files,
      this.selectedFiles,
      {
        remaining,
        maxSizeBytes: this.MAX_FILE_SIZE_BYTES,
        acceptImagesOnly: true,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
      }
    );

    if (errors.length) {
      this.sweet.showNotification('Error en archivos', errors.join('\n'), 'error');
    }

    this.selectedFiles.push(...accepted);
    this.previews.push(...objectUrls);
    this.objectUrls.push(...objectUrls);
  }

  async save() {
    if (this.isBusy) return;

    if (this.generalGroup.invalid) {
      this.generalGroup.markAllAsTouched();
      return;
    }

    this.isBusy = true;
    this.dialogRef.disableClose = true;

    try {
      const dto = this.generalGroup.getRawValue();
      let id: number;

      if (this.isEdit && this.data) {
        await firstValueFrom(this.sqSvc.update(this.data.id, { id: this.data.id, ...dto } as SquareUpdateModel));
        id = this.data.id;
      } else {
        const created = await firstValueFrom(this.sqSvc.create(dto as SquareCreateModel));
        id = created.id;
      }

      if (this.selectedFiles.length > 0) {
        await firstValueFrom(this.imgSvc.uploadImages('Plaza', id, this.selectedFiles));
      }

      this.dialogRef.close(true);

    } catch (e) {
      this.sweet.showApiError(e);
    } finally {
      this.isBusy = false;
      this.dialogRef.disableClose = false;
    }
  }

  removeNew(i: number) {
    const url = this.previews[i];
    this.filePicker.revoke(url);
    this.previews.splice(i, 1);
    this.selectedFiles.splice(i, 1);
    this.objectUrls = this.objectUrls.filter(u => u !== url);
  }

  async removeExisting(idx: number) {
    const img = this.existingImages[idx];
    await firstValueFrom(this.imgSvc.deleteById(img.id));
    this.existingImages.splice(idx, 1);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

}
