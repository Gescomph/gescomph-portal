import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import {
  NotificationDto,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../../../../core/realtime/models/notification.model';
import { NotificationStore } from '../../../../core/notifications/notification.store';
import { UserStore } from '../../../../core/security/permission/user.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
    DatePipe
  ],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css'],
})
export class NotificationBellComponent {
  private readonly store = inject(NotificationStore);
  private readonly userStore = inject(UserStore);
  readonly user = this.userStore.user;
  private readonly router = inject(Router);

  readonly items = this.store.items;
  readonly unreadCount = this.store.unreadCount;
  readonly loading = this.store.loading;
  private readonly typeLabels: Record<NotificationType, string> = {
    [NotificationType.System]: 'Sistema',
    [NotificationType.ContractCreated]: 'Contrato creado',
    [NotificationType.ContractExpiring]: 'Contrato por vencer',
    [NotificationType.Reminder]: 'Recordatorio',
  };
  private readonly priorityLabels: Record<NotificationPriority, string> = {
    [NotificationPriority.Info]: 'Info',
    [NotificationPriority.Warning]: 'Advertencia',
    [NotificationPriority.Critical]: 'Crítica',
  };

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (!currentUser) {
        this.store.reset();
        return;
      }
      void this.store.loadFeed({ take: 10 });
    });
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

  notificationTypeLabel(type: NotificationType): string {
    return this.typeLabels[type] ?? 'Sistema';
  }

  priorityLabel(priority: NotificationPriority): string {
    return this.priorityLabels[priority] ?? 'Info';
  }

  priorityClass(priority: NotificationPriority): string {
    switch (priority) {
      case NotificationPriority.Critical:
        return 'priority-critical';
      case NotificationPriority.Warning:
        return 'priority-warning';
      default:
        return 'priority-info';
    }
  }

  isUnread(notification: NotificationDto): boolean {
    return notification.status === NotificationStatus.Unread;
  }
}
