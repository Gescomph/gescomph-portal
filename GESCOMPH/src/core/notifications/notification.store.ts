import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationApiService } from './notification-api.service';
import {
  NotificationDto,
  NotificationPayload,
  NotificationStatus,
} from '../realtime/models/notification.model';
import { UserStore } from '../security/permission/user.store';

interface LoadOptions {
  take?: number;
  status?: NotificationStatus | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly api = inject(NotificationApiService);
  private readonly userStore = inject(UserStore);

  private readonly _items = signal<NotificationDto[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _unreadCount = signal(0);

  readonly items = computed(() => this._items());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly unreadCount = computed(() => this._unreadCount());

  get snapshot(): NotificationDto[] {
    return this._items();
  }

  async loadFeed(options: LoadOptions = {}): Promise<void> {
    const userId = this.userStore.snapshot?.id;
    if (!userId) {
      this.reset();
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    try {
      const data = await firstValueFrom(this.api.getFeed(userId, options));
      this.setAll(data);
    } catch (err) {
      this._error.set((err as any)?.message ?? 'Error loading notifications');
    } finally {
      this._loading.set(false);
    }
  }

  async refreshUnread(): Promise<void> {
    const userId = this.userStore.snapshot?.id;
    if (!userId) {
      this._unreadCount.set(0);
      return;
    }

    try {
      const unread = await firstValueFrom(this.api.getUnread(userId));
      this.mergeAndUpdate(unread);
    } catch (err) {
      this._error.set((err as any)?.message ?? 'Error loading unread notifications');
    }
  }

  async markAsRead(id: number): Promise<void> {
    const userId = this.userStore.snapshot?.id;
    if (!userId) return;

    try {
      await firstValueFrom(this.api.markAsRead(id, userId));
      this.patchOne(id, { status: NotificationStatus.Read, readAt: new Date().toISOString() });
    } catch (err) {
      this._error.set((err as any)?.message ?? 'Error marking notification as read');
      throw err;
    }
  }

  async markAllAsRead(): Promise<void> {
    const userId = this.userStore.snapshot?.id;
    if (!userId) return;

    try {
      await firstValueFrom(this.api.markAllAsRead(userId));
      this.markAllAsReadLocal();
    } catch (err) {
      this._error.set((err as any)?.message ?? 'Error marking notifications as read');
      throw err;
    }
  }

  handleRealtimeNotification(payload: NotificationPayload): void {
    this.mergeAndUpdate([payload]);
  }

  reset(): void {
    this._items.set([]);
    this._unreadCount.set(0);
    this._error.set(null);
    this._loading.set(false);
  }

  private setAll(list: NotificationDto[]): void {
    this._items.set(list ?? []);
    this.recalculateUnread();
  }

  private patchOne(id: number, patch: Partial<NotificationDto>): void {
    this._items.update(current => {
      const index = current.findIndex(n => n.id === id);
      if (index === -1) return current;
      const next = current.slice();
      next[index] = { ...next[index], ...patch };
      return next;
    });
    this.recalculateUnread();
  }

  private markAllAsReadLocal(): void {
    this._items.update(current =>
      current.map(n =>
        n.status === NotificationStatus.Read
          ? n
          : { ...n, status: NotificationStatus.Read, readAt: n.readAt ?? new Date().toISOString() }
      )
    );
    this._unreadCount.set(0);
  }

  private mergeAndUpdate(list: NotificationDto[]): void {
    if (!list?.length) return;

    this._items.update(current => {
      const map = new Map<number, NotificationDto>();
      for (const item of current) map.set(item.id, item);

      for (const item of list) {
        map.set(item.id, { ...(map.get(item.id) ?? {}), ...item });
      }

      // Ordenar por fecha de creación descendente
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return merged;
    });

    this.recalculateUnread();
  }

  private recalculateUnread(): void {
    const count = this._items().reduce(
      (acc, curr) => acc + (curr.status === NotificationStatus.Unread ? 1 : 0),
      0
    );
    this._unreadCount.set(count);
  }
}
