import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/security/auth/auth.service';
import { AppError } from '../../../../core/models/errors/app-error.model';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { TwoFactorContextService } from './state/two-factor-context.service';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './two-factor.component.html',
  styleUrls: ['./two-factor.component.css'],
})
export class TwoFactorComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private twoFactorContext = inject(TwoFactorContextService);
  private sweet = inject(SweetAlertService);

  form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern('\\d{6}')]],
  });

  isSubmitting = false;
  isResending = false;

  constructor() {
    if (!this.challenge) {
      this.router.navigate(['/auth/login']);
    }
  }

  get codeCtrl(): AbstractControl {
    return this.form.get('code')!;
  }

  get challenge() {
    return this.twoFactorContext.challenge();
  }

  get expiresAtLabel() {
    const challenge = this.challenge;
    if (!challenge) return null;
    const expiration = new Date(challenge.expiresAt);
    return expiration.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  confirmCode(): void {
    if (!this.challenge) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.auth
      .ConfirmTwoFactor({
        email: this.challenge.email,
        code: this.codeCtrl.value.trim(),
      })
      .subscribe({
        next: () => {
          this.twoFactorContext.clear();
          void this.sweet.showNotification('Verificacion completada', 'Tu sesion ya esta habilitada.', 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (err: AppError) => this.handleApiError(err),
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }

  resendCode(): void {
    if (!this.challenge) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isResending = true;
    this.auth.ResendTwoFactorCode({ email: this.challenge.email }).subscribe({
      next: response => {
        this.twoFactorContext.setChallenge(response.challenge);
        void this.sweet.showNotification('Codigo reenviado', 'Revisa tu correo para encontrarlo.', 'info');
      },
      error: (err: AppError) => this.handleApiError(err),
      complete: () => {
        this.isResending = false;
      },
    });
  }

  returnToLogin(): void {
    this.twoFactorContext.clear();
  }

  private handleApiError(error: AppError): void {
    this.isSubmitting = false;
    this.isResending = false;

    if (error.type === 'Unauthorized') {
      void this.sweet.showNotification('Codigo invalido', error.message, 'error');
    } else {
      void this.sweet.showApiError(error);
    }
  }
}
