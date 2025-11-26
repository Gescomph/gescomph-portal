import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {

  currentSlide = 0;
  intervalId: any;

  slides: string[] = [
    "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 400%22%3E%3Cdefs%3E%3ClinearGradient id=%22g1%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%2328a745;stop-opacity:0.1%22/%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%2328a745;stop-opacity:0.3%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=%22%23ffffff%22 width=%221200%22 height=%22400%22/%3E%3Crect fill=%22url(%23g1)%22 width=%221200%22 height=%22400%22/%3E%3Cpath d=%22M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z%22 fill=%22%2328a745%22 opacity=%220.05%22/%3E%3Ccircle cx=%22150%22 cy=%2280%22 r=%2240%22 fill=%22%2328a745%22 opacity=%220.1%22/%3E%3Ccircle cx=%221050%22 cy=%22320%22 r=%2260%22 fill=%22%2328a745%22 opacity=%220.08%22/%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 400%22%3E%3Cdefs%3E%3ClinearGradient id=%22g2%22 x1=%22100%25%22 y1=%220%25%22 x2=%220%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%2328a745;stop-opacity:0.15%22/%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%2328a745;stop-opacity:0.25%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=%22%23f0f9f0%22 width=%221200%22 height=%22400%22/%3E%3Crect fill=%22url(%23g2)%22 width=%221200%22 height=%22400%22/%3E%3Cpath d=%22M0,150 Q300,250 600,150 T1200,150 L1200,0 L0,0 Z%22 fill=%22%2328a745%22 opacity=%220.06%22/%3E%3Ccircle cx=%22300%22 cy=%22200%22 r=%2250%22 fill=%22%2328a745%22 opacity=%220.08%22/%3E%3Ccircle cx=%22900%22 cy=%22150%22 r=%2245%22 fill=%22%2328a745%22 opacity=%220.1%22/%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 400%22%3E%3Cdefs%3E%3ClinearGradient id=%22g3%22 x1=%2250%25%22 y1=%220%25%22 x2=%2250%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%2328a745;stop-opacity:0.12%22/%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%2328a745;stop-opacity:0.28%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=%22%23ffffff%22 width=%221200%22 height=%22400%22/%3E%3Crect fill=%22url(%23g3)%22 width=%221200%22 height=%22400%22/%3E%3Cpath d=%22M0,250 Q300,150 600,250 T1200,250 L1200,400 L0,400 Z%22 fill=%22%2328a745%22 opacity=%220.04%22/%3E%3Ccircle cx=%22600%22 cy=%22100%22 r=%2255%22 fill=%22%2328a745%22 opacity=%220.09%22/%3E%3Ccircle cx=%22200%22 cy=%22350%22 r=%2235%22 fill=%22%2328a745%22 opacity=%220.07%22/%3E%3C/svg%3E"
  ];

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(i: number) {
    this.currentSlide = i;
  }
}
