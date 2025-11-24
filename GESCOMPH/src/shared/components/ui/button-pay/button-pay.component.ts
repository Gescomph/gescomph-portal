import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { finalize } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ContractSelectModel } from '../../../../features/contracts/models/contract.models';
import { MonthlyObligation } from '../../../../features/contracts/models/obligation-month.models';

interface CheckoutResponse {
  url: string;
}

@Component({
  standalone: true,
  selector: 'app-button-pay',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './button-pay.component.html',
  styleUrl: './button-pay.component.css'
})
export class ButtonPayComponent {

  @Input() contract?: ContractSelectModel | null;
  @Input() obligation?: MonthlyObligation | null;

  loading = false;
  error: string | null = null;

  constructor(private readonly http: HttpClient) {}

  get canPay(): boolean {
    return !!this.contract?.id && !!this.obligation?.id;
  }

  pay(): void {
    if (!this.canPay) {
      this.error = 'Selecciona un contrato y una obligación para pagar.';
      return;
    }

    this.loading = true;
    this.error = null;

    const url = `${environment.apiURL}/payments/obligations/${this.obligation!.id}/checkout`;

    this.http
      .post<CheckoutResponse>(url, {})
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (!response?.url) {
            this.error = 'No se pudo obtener la URL de Mercado Pago.';
            return;
          }

          // Redirigir al Checkout Pro
          window.location.href = response.url;
        },

        error: (err) => {
          console.error('Error creando preferencia Mercado Pago:', err);
          this.error = 'No se pudo iniciar el pago. Intenta nuevamente.';
        }
      });
  }
}

