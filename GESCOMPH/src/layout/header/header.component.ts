import { Component, computed, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DriverJsService } from '../../shared/services/driver/driver-js.services';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UserStore } from '../../core/security/permission/user.store';
import { PageHeaderService } from '../../shared/services/page-header/page-header.service';
import { AuthService } from '../../core/security/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Input() toggleDrawer!: () => void;
  @Input() title!: string;
  @Input() description!: string;

  private header = inject(PageHeaderService);
  private userStore = inject(UserStore);
  private authService = inject(AuthService);

  displayTitle = computed(() => this.header.title() || this.title || '');
  displayDescription = computed(
    () => this.header.description() || this.description || ''
  );

  username = computed(() => this.userStore.user()?.fullName);

  private router = inject(Router);
  private driverJsService = inject(DriverJsService);

  logout() {
    this.authService.logout().subscribe();
  }

  startHelpTour() {
    const currentRoute = this.router.url.split('?')[0]; // sin query params
    console.log('[HEADER] Ejecutando tour para:', currentRoute);

    this.driverJsService.run(currentRoute);
  }
}
