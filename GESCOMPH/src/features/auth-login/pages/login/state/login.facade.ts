import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/security/auth/auth.service';
import { SweetAlertService } from '../../../../../shared/utils/notifications/sweet-alert.service';
import { AppError } from '../../../../../core/models/errors/app-error.model';
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

  login(credentials: LoginModel) {
    // Mostrar loading inicial
    this.sweet.showLoading('Iniciando sesión', 'Por favor, espere...');

    return this.auth.Login(credentials).pipe(
      // 🟩 Éxito
      switchMap(() =>
        defer(() => from(this.sweet.hideLoading())).pipe(
          tap(() =>
            this.sweet.showNotification(
              'Bienvenido',
              'Inicio de sesión exitoso.',
              'success'
            )
          ),
          tap(() => this.router.navigate(['/dashboard']))
        )
      ),

      // 🟥 Error
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
