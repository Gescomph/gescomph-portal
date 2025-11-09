import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { REQ_AUTH_HEADER, SKIP_REFRESH_HEADER } from '../../../shared/var/http.constants';

@Injectable({ providedIn: 'root' })
export class RefreshCoordinatorService {
  private refreshing = signal(false);
  private queue: Subject<boolean>[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** Lanza un refresh si no hay uno en curso. Los concurrentes esperan. */
  runOrWait(): Observable<boolean> {
    if (!this.refreshing()) {
      this.refreshing.set(true);
      const done$ = new Subject<boolean>();
      this.queue.push(done$);

      const headers = new HttpHeaders({
        [REQ_AUTH_HEADER]: '1',
        [SKIP_REFRESH_HEADER]: '1'
      });

      return this.http
        .post(environment.apiURL + '/auth/refresh', {}, { withCredentials: true, headers })
        .pipe(
          // rehidrata /me sin disparar refresh
          switchMap(() => this.auth.ReloadMeSkipRefresh()),
          switchMap(() => {
            this.resolveQueue(true);
            return new Observable<boolean>(observer => {
              observer.next(true);
              observer.complete();
            });
          }),
          catchError(err => {
            this.rejectQueue(err);
            return throwError(() => err);
          }),
          finalize(() => this.refreshing.set(false))
        );
    } else {
      // ya hay refresh: devolvemos un observable que se completa cuando termine
      const waiter$ = new Subject<boolean>();
      this.queue.push(waiter$);
      return waiter$.asObservable();
    }
  }

  private resolveQueue(ok: boolean) {
    this.queue.forEach(subject => {
      subject.next(ok);
      subject.complete();
    });
    this.queue = [];
  }

  private rejectQueue(err: unknown) {
    this.queue.forEach(subject => subject.error(err));
    this.queue = [];
  }
}
