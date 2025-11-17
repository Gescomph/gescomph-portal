import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationDto, NotificationStatus } from '../realtime/models/notification.model';

interface FeedOptions {
  status?: NotificationStatus | null;
  take?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURL}/notification`;

  getFeed(userId: number, options: FeedOptions = {}): Observable<NotificationDto[]> {
    let params = new HttpParams();
    if (options.status != null) {
      params = params.set('status', String(options.status));
    }
    if (options.take != null) {
      params = params.set('take', String(options.take));
    }

    return this.http.get<NotificationDto[]>(`${this.baseUrl}/feed/${userId}`, {
      params,
      withCredentials: true,
    });
  }

  getUnread(userId: number): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.baseUrl}/${userId}/unread`, {
      withCredentials: true,
    });
  }

  markAsRead(notificationId: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.patch<void>(`${this.baseUrl}/${notificationId}/read`, null, {
      params,
      withCredentials: true,
    });
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/mark-all/${userId}/read`, null, {
      withCredentials: true,
    });
  }
}
