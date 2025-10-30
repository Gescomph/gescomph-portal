import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../security/auth/auth.service';
import { AuthEventsService } from '../../../security/auth/auth-events.service';
import { UserStore } from '../../../security/permission/user.store';

const isRefreshing = signal(false);
const refreshError = signal<Error | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const userStore = inject(UserStore);
  const authEvents = inject(AuthEventsService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiURL);
  const isRefreshEndpoint = /\/auth\/refresh$/i.test(req.url);
  const isLoginEndpoint = /\/auth\/login$/i.test(req.url);

  effect(() => {
    const err = refreshError();
    if (!err) return;
    userStore.clear();
    authEvents.sessionExpired();
    router.navigate(['/auth/login']).catch(() => {});
  });

  return next(req).pipe(
    catchError((error) => {
      const isHttp = error instanceof HttpErrorResponse;
      const status = isHttp ? error.status : 0;

      if (isApiRequest && isRefreshEndpoint && isHttp) {
        refreshError.set(error);
        return throwError(() => ({ __authExpired: true, status: 401 }));
      }

      if (isHttp && status === 401 && isApiRequest && !isRefreshEndpoint) {
        if (isLoginEndpoint) {
          return throwError(() => error);
        }

        if (isRefreshing()) {
          return of(null).pipe(switchMap(() => next(req)));
        }

        isRefreshing.set(true);
        return authService.RefreshToken().pipe(
          switchMap(() => next(req)),
          catchError((refreshErr) => {
            refreshError.set(refreshErr);
            return throwError(() => refreshErr);
          }),
          switchMap((res) => {
            isRefreshing.set(false);
            refreshError.set(null);
            return of(res);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
