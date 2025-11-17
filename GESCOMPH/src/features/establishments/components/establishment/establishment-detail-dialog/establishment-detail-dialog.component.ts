import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';
import { StandardButtonComponent } from '../../../../../shared/components/ui/standard-button/standard-button.component';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { EstablishmentSelect } from '../../../models/establishment.models';
import { ImageService } from '../../../services/image/image.service';
import { ImageModel } from '../../../models/images.models';

@Component({
  selector: 'app-establishment-detail-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    StandardButtonComponent,
    MoneyPipe,
    MatDialogModule
  ],
  templateUrl: './establishment-detail-dialog.component.html',
  styleUrls: ['./establishment-detail-dialog.component.css'],
})
export class EstablishmentDetailDialogComponent implements OnInit, OnDestroy {

  currentImageIndex = 0;
  private intervalId?: number;

  @Output() readonly onCreateAppointment = new EventEmitter<number>();

  private readonly dialogRef = inject(MatDialogRef<EstablishmentDetailDialogComponent>);
  readonly data = inject<EstablishmentSelect>(MAT_DIALOG_DATA);
  private readonly imageService = inject(ImageService);

  /** cache local que SÍ podemos mutar */
  images: ImageModel[] = [];

  ngOnInit(): void {
    this.initImages();
  }

  ngOnDestroy(): void {
    this.clearCarousel();
  }

  private initImages(): void {
    // si ya vino del padre
    if (this.data.images?.length) {
      this.images = [...this.data.images];
      if (this.images.length > 1) this.startCarousel();
      return;
    }

    // si no, consulta al backend (AJUSTE polimórfico)
    const id = this.data?.id;
    if (!id) return;

    this.imageService
      .getImages("Establishment", id)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener imágenes del establecimiento:', error);
          return of([]);
        })
      )
      .subscribe((imgs) => {
        this.images = imgs ?? [];
        if (this.images.length > 1) this.startCarousel();
      });
  }

  private startCarousel(): void {
    this.intervalId = window.setInterval(() => this.nextImage(), 3000);
  }

  private clearCarousel(): void {
    if (this.intervalId) window.clearInterval(this.intervalId);
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  prevImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
    this.clearCarousel();
    this.startCarousel();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  handleCreateAppointment(): void {
    this.onCreateAppointment.emit(this.data.id);
    this.dialogRef.close({
      action: 'createAppointment',
      establishment: this.data,
    });
  }

  viewImage(imagePath: string): void {
    window.open(imagePath, '_blank');
  }

  imgSrc(img: any): string {
    return img?.filePath ?? img?.FilePath ?? '';
  }
}
