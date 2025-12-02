import { Component, computed, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserStore } from '../../core/security/permission/user.store';
import { PageHeaderService } from '../../shared/services/page-header/page-header.service';
import { AuthService } from '../../core/security/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, MatTooltipModule],
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

  // Si el servicio tiene valor → lo usa; si no, cae al @Input del layout (route data)
  displayTitle = computed(() => this.header.title() || this.title || '');
  displayDescription = computed(
    () => this.header.description() || this.description || ''
  );

  username = computed(() => this.userStore.user()?.fullName);

  logout() {
    this.authService.logout().subscribe();
  }
}
