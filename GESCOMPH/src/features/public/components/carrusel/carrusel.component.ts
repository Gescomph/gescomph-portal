import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Carousel } from 'bootstrap';

@Component({
  selector: 'app-carrusel',
  imports: [MatIconModule, CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.css'],
})
export class CarruselComponent implements AfterViewInit {
  @ViewChild('carouselElement', { static: true }) carouselElement!: ElementRef;
  private carouselInstance!: Carousel;

  protected readonly images = [
    { src: 'assets/lugares-turisticos/Megacolegio-Palermo.jpg', alt: 'Megacolegio Palermo', title: 'Megacolegio Palermo', description: 'Educación y desarrollo en el corazón de Palermo' },
    { src: 'assets/lugares-turisticos/hospital.jpg', alt: 'Hospital de Palermo', title: 'Hospital de Palermo', description: 'Comprometidos con la salud de nuestra comunidad' },
    { src: 'assets/lugares-turisticos/gruta-Santa-Rosalía.jpg', alt: 'Gruta Santa Rosalía', title: 'Gruta Santa Rosalía', description: 'Un lugar emblemático lleno de historia y fe' },
  ];

  ngAfterViewInit(): void {
    this.carouselInstance = new Carousel(this.carouselElement.nativeElement, {
      interval: 4000,
      ride: 'carousel',
      pause: false,
      wrap: true,
    });
  }

  next(): void {
    this.carouselInstance.next();
  }

  prev(): void {
    this.carouselInstance.prev();
  }
}
