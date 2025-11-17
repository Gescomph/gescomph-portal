import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/security/auth/auth.service';
import { SweetAlertService } from '../../../../../shared/utils/notifications/sweet-alert.service';
import { AppError } from '../../../../../core/models/errors/app-error.model';
import { TwoFactorContextService } from '../../two-factor/state/two-factor-context.service';
import {
  catchError,
  defer,
  from,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { LoginModel } from '../../../models/login.models';

@Injectable({ providedIn: 'root' })
export class LoginFacade {
  private auth = inject(AuthService);
  private router = inject(Router);
  private sweet = inject(SweetAlertService);
  private twoFactorContext = inject(TwoFactorContextService);

  login(credentials: LoginModel) {
    // Mostrar loading inicial
    this.sweet.showLoading('Iniciando sesion', 'Por favor, espere...');
    this.twoFactorContext.clear();

    return this.auth.Login(credentials).pipe(
      // Exito
      switchMap(result =>
        defer(() => from(this.sweet.hideLoading())).pipe(
          tap(() => {
            if (result.requiresTwoFactor && result.challenge) {
              this.twoFactorContext.setChallenge(result.challenge);
              this.sweet.showNotification(
                'Verificacion adicional',
                'Se ha enviado un codigo de seguridad al correo.',
                'info'
              );
              this.router.navigate(['/auth/two-factor']);
              return;
            }

            this.sweet.showNotification(
              'Bienvenido',
              'Inicio de sesion exitoso.',
              'success'
            );
            this.router.navigate(['/dashboard']);
          })
        )
      ),

      // Error
      catchError((err: AppError) =>
        defer(() => from(this.sweet.hideLoading())).pipe(
          tap(() => {
            if (err.type === 'Unauthorized') {
              this.sweet.showNotification('Error', err.message, 'error');
            } else {
              this.sweet.showApiError(err);
            }
          }),
          switchMap(() => throwError(() => err)) // repropaga el error
        )
      )
    );
  }
}
