import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { NotificationDto, NotificationStatus } from '../../../../core/realtime/models/notification.model';
import { NotificationStore } from '../../../../core/notifications/notification.store';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
  ],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css'],
})
export class NotificationBellComponent {
  private readonly store = inject(NotificationStore);
  private readonly router = inject(Router);

  readonly items = this.store.items;
  readonly unreadCount = this.store.unreadCount;
  readonly loading = this.store.loading;

  constructor() {
    void this.store.loadFeed({ take: 10 });
  }

  trackById(_: number, item: NotificationDto): number {
    return item.id;
  }

  async onNotificationClick(notification: NotificationDto): Promise<void> {
    if (notification.status === NotificationStatus.Unread) {
      await this.store.markAsRead(notification.id);
    }
    if (notification.actionRoute) {
      this.router.navigateByUrl(notification.actionRoute);
    }
  }

  async markAllAsRead(): Promise<void> {
    await this.store.markAllAsRead();
  }

  async refresh(): Promise<void> {
    await this.store.loadFeed({ take: 10 });
  }

  asDate(value: string | null | undefined): Date | null {
    return value ? new Date(value) : null;
  }
}
