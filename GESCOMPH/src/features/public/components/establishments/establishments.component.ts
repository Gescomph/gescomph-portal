import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CardComponent } from '../../../../shared/components/ui/card/card.component';
import { EstablishmentSelect } from '../../../establishments/models/establishment.models';

@Component({
  selector: 'app-establishments',
  imports: [
    CommonModule,
    CardComponent,
    RouterLink,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './establishments.component.html',
  styleUrls: ['./establishments.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstablishmentsComponent implements AfterViewInit {
  /** Datos */
  @Input({ required: true }) establishments: EstablishmentSelect[] = [];
  @Output() view = new EventEmitter<number>();
  @Output() createAppointment = new EventEmitter<number>();

  /** Referencias y estados */
  @ViewChild('carrusel', { static: false })
  carruselRef!: ElementRef<HTMLDivElement>;

  canScrollLeft = false;
  canScrollRight = false;

  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private mutationObserver?: MutationObserver;

  // ---------------------------------------------------------
  // 🧠 Ciclo de vida
  // ---------------------------------------------------------
  ngAfterViewInit(): void {
    const el = this.carruselRef?.nativeElement;
    if (!el) return;

    // Actualizar cuando el usuario haga scroll
    fromEvent(el, 'scroll')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateScrollButtons());

    // Actualizar al cambiar el tamaño de la ventana
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateScrollButtons());

    // Observar cambios dinámicos en el DOM (por si se agregan/quitán cards)
    const list = el.querySelector('.carrusel-locales');
    if (list) {
      this.mutationObserver = new MutationObserver(() =>
        this.updateScrollButtons()
      );
      this.mutationObserver.observe(list, { childList: true, subtree: true });
      this.destroyRef.onDestroy(() => this.mutationObserver?.disconnect());
    }

    //  Esperar a que Angular y el DOM estén completamente estables
    this.ngZone.onStable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateScrollButtons());
  }

  // ---------------------------------------------------------
  // 🎯 Funciones de scroll
  // ---------------------------------------------------------
  scrollCarrusel(direction: number): void {
    const el = this.carruselRef?.nativeElement;
    if (!el) return;

    const amount = el.clientWidth;
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });

    // Pequeño delay para recalcular posición tras la animación
    setTimeout(() => this.updateScrollButtons(), 350);
  }

  private updateScrollButtons(): void {
    const el = this.carruselRef?.nativeElement;
    if (!el) {
      this.canScrollLeft = false;
      this.canScrollRight = false;
      this.cdr.markForCheck();
      return;
    }

    this.canScrollLeft = el.scrollLeft > 5;
    this.canScrollRight = el.scrollWidth - el.clientWidth - el.scrollLeft > 5;

    // 🔁 Forzar verificación de cambios (OnPush)
    this.cdr.markForCheck();
  }

  // ---------------------------------------------------------
  // ⚡ Eventos UI
  // ---------------------------------------------------------
  onViewClick(id: number): void {
    this.view.emit(id);
  }

  onCreateAppointmentClick(id: number): void {
    this.createAppointment.emit(id);
  }
}
