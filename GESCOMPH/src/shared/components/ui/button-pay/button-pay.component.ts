import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-button-pay',
  imports: [],
  templateUrl: './button-pay.component.html',
  styleUrl: './button-pay.component.css'
})
export class ButtonPayComponent implements AfterViewInit, OnDestroy {

  private scriptElement?: HTMLScriptElement;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.loadMercadoPagoScript();
  }

  ngOnDestroy(): void {
    // Limpieza para evitar duplicados si el componente se destruye
    if (this.scriptElement) {
      this.el.nativeElement.removeChild(this.scriptElement);
    }
  }

  private loadMercadoPagoScript(): void {
    // Elimina versiones previas
    const existingScript = this.el.nativeElement.querySelector('script[data-source="button"]');
    if (existingScript) existingScript.remove();

    this.scriptElement = document.createElement('script');
    this.scriptElement.src = 'https://www.mercadopago.com.co/integrations/v1/web-payment-checkout.js';
    this.scriptElement.setAttribute('data-preference-id', '42011033-358f9d87-871b-4c99-8fdf-a5823dee7df9');
    this.scriptElement.setAttribute('data-source', 'button');

    this.el.nativeElement.querySelector('#mp-button-container')?.appendChild(this.scriptElement);
  }
}
