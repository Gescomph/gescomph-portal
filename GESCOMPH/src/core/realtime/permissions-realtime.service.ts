import { ApplicationRef, Injectable, NgZone, inject } from '@angular/core';
import { UserStore } from '../security/permission/user.store';
import { AuthService } from '../security/auth/auth.service';
import { BaseRealtimeService } from './base/base-realtime.service';

type PermissionsUpdatedPayload = { userIds?: number[] };

@Injectable({ providedIn: 'root' })
export class PermissionsRealtimeService extends BaseRealtimeService {
  private readonly auth = inject(AuthService);
  private readonly userStore = inject(UserStore);
  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);

  private refreshing = false;

  constructor() {
    super();
    this.connect('security');
    this.bindHandlers();
  }

  private bindHandlers(): void {
    this.hub!.on('permissions:updated', (payload: PermissionsUpdatedPayload) => {
      this.zone.run(() => this.handlePermissionsUpdated(payload));
    });

    this.hub!.onreconnected(() => {
      this.zone.run(() => this.refreshMe());
    });

    this.hub!.onclose(err => {
      if (err) console.warn('[SignalR] SecurityHub closed', err);
    });
  }

  private handlePermissionsUpdated(payload: PermissionsUpdatedPayload) {
    const ids = payload?.userIds ?? [];
    const me = this.userStore.snapshot?.id;
    if (ids.length > 0 && (me == null || !ids.includes(me))) return;
    this.refreshMe();
  }

  private refreshMe() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.auth.GetMe().subscribe({
      next: () => this.appRef.tick(),
      error: () => (this.refreshing = false),
      complete: () => (this.refreshing = false),
    });
  }
}
