import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthEventsService } from '../core/security/auth/auth-events.service';
import { SweetAlertService } from '../shared/utils/notifications/sweet-alert.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  router = inject(Router);
  private authEvents: AuthEventsService = inject(AuthEventsService);
  private sweetAlertService = inject(SweetAlertService);
  protected title = 'FrontGESCOMPH';

  constructor() {
    // Listener global: ante expiración o logout forzado, mostrar mensaje y llevar a login
    this.authEvents.onEvents().subscribe(async (ev) => {
      if (ev.type === 'SESSION_EXPIRED') {
        await this.sweetAlertService.error('Tu sesión ha expirado. Vuelve a iniciar sesión.', 'Sesión expirada');
        this.router.navigate(['/auth/login']);
      }
      if (ev.type === 'LOGOUT') {
        await this.sweetAlertService.success('Has cerrado sesión correctamente.', 'Sesión cerrada');
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
