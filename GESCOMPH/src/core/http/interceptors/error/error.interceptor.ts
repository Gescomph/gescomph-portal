import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AppError } from '../../../models/errors/app-error.model';
import { mapHttpErrorToAppError } from '../../mappers/error-mapper';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';

// Previene toasts duplicados (mismo traceId del backend)
const shownTraceIds = new Map<string, number>();
const DEDUP_WINDOW_MS = 30_000; // 30s

function shouldNotifyOnce(appError: AppError): boolean {
  try {
    const traceId = appError?.traceId;
    const now = Date.now();

    // Limpieza simple por ventana
    for (const [k, ts] of shownTraceIds) {
      if (now - ts > DEDUP_WINDOW_MS) shownTraceIds.delete(k);
    }

    if (!traceId) return true; // si no hay traceId, no deduplicamos
    if (shownTraceIds.has(traceId)) return false;
    shownTraceIds.set(traceId, now);
    return true;
  } catch {
    return true;
  }
}

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const sweetAlertService = inject(SweetAlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError: AppError = mapHttpErrorToAppError(error);

      // 401: manejado por otro interceptor (p.ej., refresh token)
      if (appError.status !== 401) {
        const msg = appError.message || 'Ocurrió un error inesperado';

        // No mostrar toast si es validación o 404
        const suppressToast =
          appError.type === 'Validation' || appError.status === 404;

        if (!suppressToast && shouldNotifyOnce(appError)) {
          // Llamada asíncrona sin bloquear la cadena RxJS
          sweetAlertService.showNotification('Error', msg, 'error');
        }
      }

      return throwError(() => appError);
    })
  );
};
