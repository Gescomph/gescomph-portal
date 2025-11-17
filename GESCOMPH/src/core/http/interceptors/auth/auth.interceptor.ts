import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { REQ_AUTH_HEADER, SKIP_REFRESH_HEADER } from '../../../../shared/var/http.constants';
import { AuthEventsService } from '../../../security/auth/auth-events.service';
import { RefreshCoordinatorService } from '../../../security/auth/refresh-coordinator.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const refresher = inject(RefreshCoordinatorService);
  const events = inject(AuthEventsService);

  const requiresAuth = req.headers.get(REQ_AUTH_HEADER) === '1';
  const skipRefresh = req.headers.get(SKIP_REFRESH_HEADER) === '1';

  return next(req).pipe(
    catchError((err: unknown) => {
      const http = err as HttpErrorResponse;
      const status = http?.status ?? 0;

      // /refresh 401 → sesión inválida definitiva
      if (skipRefresh && status === 401) {
        events.sessionExpired();
        return throwError(() => http);
      }

      // Solo refrescar si el request ORIGINAL requiere auth
      if (status === 401 && requiresAuth && !skipRefresh) {
        return refresher.runOrWait().pipe(
          // cuando termine el refresh (ok), reintenta el request original
          switchMap(() => next(req)),
          catchError(e => {
            // si el refresh falló, notificamos expiración
            events.sessionExpired();
            return throwError(() => e);
          })
        );
      }

      return throwError(() => http);
    })
  );
};
