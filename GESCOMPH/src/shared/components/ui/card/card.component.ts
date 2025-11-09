import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  effect,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ButtonComponent } from '../button/button.component';
import { CardResource } from '../../../models/card/card.models';

export interface CardToggleConfig {
  checked: boolean;
  disabled?: boolean;
  label?: string;
  labelPosition?: 'before' | 'after';
  color?: ThemePalette;
  ariaLabel?: string;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    ButtonComponent,
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input({ required: true }) resource!: CardResource;
  @Input() showAvailableTag = true; // establishments = true / plazas = false
  @Input() toggleConfig: CardToggleConfig | null = null;
  @Input() showViewMore = true;
  @Input() showViewButton = true;



  @Output() readonly view = new EventEmitter<number>();
  @Output() readonly edit = new EventEmitter<number>();
  @Output() readonly delete = new EventEmitter<number>();
  @Output() readonly toggleChanged = new EventEmitter<boolean>();

  private readonly cloudinaryBase = 'https://res.cloudinary.com/dmbndpjlh/';

  readonly loading = signal<boolean>(true);
  readonly errored = signal<boolean>(false);

  readonly primaryImage = computed<string | null>(() => {
    if (this.resource.primaryImagePath) return this.resource.primaryImagePath;

    const first = this.resource.images?.[0];
    return first?.filePath ?? first?.filePath ?? null;
  });

  readonly isCloudinary = computed(() => {
    const src = this.primaryImage();
    return !!src && src.startsWith(this.cloudinaryBase) && src.includes('/image/upload/');
  });

  readonly cloudinaryPath = computed(() => {
    const src = this.primaryImage();
    if (!src || !this.isCloudinary()) return '';
    const relative = src.substring(this.cloudinaryBase.length);
    const marker = 'image/upload/';
    const idx = relative.indexOf(marker);
    if (idx < 0) return relative;
    const rest = relative.substring(idx + marker.length);
    return `c_fill,ar_2:1/${rest}`;
  });

  readonly formattedRent = computed(() =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
      .format(this.resource?.rentValueBase ?? 0),
  );

  readonly shortDescription = computed(() => {
    const desc = this.resource?.description?.toString().trim() ?? '';
    const maxLength = 110;
    return desc.length > maxLength ? `${desc.slice(0, maxLength).trim()}…` : desc;
  });

  constructor() {
    effect(() => {
      void this.primaryImage();
      this.loading.set(true);
      this.errored.set(false);
    });
  }

  onLoad(): void { this.loading.set(false); }
  onError(): void { this.loading.set(false); this.errored.set(true); }
  onToggleChange(evt: MatSlideToggleChange): void { this.toggleChanged.emit(evt.checked); }

  handleView(): void { this.view.emit(this.resource.id); }
  handleEdit(): void { this.edit.emit(this.resource.id); }
  handleDelete(): void { this.delete.emit(this.resource.id); }
}
