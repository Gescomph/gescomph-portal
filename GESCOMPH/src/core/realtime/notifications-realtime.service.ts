import { ApplicationRef, inject, Injectable, NgZone } from '@angular/core';
import { BaseRealtimeService } from './base/base-realtime.service';
import { NotificationPayload } from './models/notification.model';
import { NotificationStore } from '../notifications/notification.store';

@Injectable({ providedIn: 'root' })
export class NotificationsRealtimeService extends BaseRealtimeService {
  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);
  private readonly store = inject(NotificationStore);

  constructor() {
    super();
    this.connect('notifications');
    this.bindHandlers();
  }

  private bindHandlers(): void {
    this.hub!.on('notifications:new', (payload: NotificationPayload) => {
      this.zone.run(() => this.handleNotification(payload));
    });

    this.hub!.onreconnected(() => {
      this.zone.run(() => this.handleReconnected());
    });
  }

  protected handleNotification(_payload: NotificationPayload): void {
    this.store.handleRealtimeNotification(_payload);
    this.appRef.tick();
  }

  protected handleReconnected(): void {
    void this.store.loadFeed();
  }
}
