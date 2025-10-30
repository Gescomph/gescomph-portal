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

// Evita toasts duplicados para el mismo error (mismo traceId del backend)
const shownTraceIds = new Map<string, number>();
const DEDUP_WINDOW_MS = 30_000; // 30s

function shouldNotifyOnce(problem: any): boolean {
  try {
    const traceId: string | undefined = problem?.traceId;
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
      // Mostrar toast para errores de API excepto 401 (manejados por authInterceptor)
      if (error.status !== 401) {
        // Mapear tipo a icono: Validation/Business => error
        const msg = appError.message || 'Ocurrió un error inesperado';

        // Evitar toasts en validaciones y 404 para no duplicar mensajes inline del formulario
        const suppressToast =
          appError.type === 'Validation' || error.status === 404;

        if (!suppressToast && shouldNotifyOnce(error?.error)) {
          // No esperar el promise para no bloquear la cadena
          sweetAlertService.showNotification('Error', msg, 'error');
        }
      }
      return throwError(() => appError);
    })
  );
};
