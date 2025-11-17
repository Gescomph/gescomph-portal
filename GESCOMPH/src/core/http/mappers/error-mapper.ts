import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from '../../models/errors/app-error.model';

export function mapHttpErrorToAppError(error: HttpErrorResponse): AppError {
  const err = error.error ?? {};
  let type: AppError['type'] = 'Unexpected';
  let message = 'Ocurrió un error inesperado';

  // 🔸 Error de red o CORS
  if (error.status === 0) {
    return {
      type: 'Network',
      message: 'No hay conexión con el servidor. Verifica tu red o CORS.',
      status: error.status,
    };
  }

  // 🔸 Autenticación y autorización
  if (error.status === 401) {
    return {
      type: 'Unauthorized',
      message: err.detail || 'No autorizado. Debes iniciar sesión.',
      status: error.status,
      traceId: err.traceId,
    };
  }

  if (error.status === 403) {
    return {
      type: 'Forbidden',
      message: err.detail || 'No tienes permisos para esta acción.',
      status: error.status,
      traceId: err.traceId,
    };
  }

  // 🔸 No encontrado
  if (error.status === 404) {
    return {
      type: 'NotFound',
      message: err.detail || 'Recurso no encontrado.',
      status: error.status,
      traceId: err.traceId,
    };
  }

  // 🔸 Validación (RFC 7807 ValidationProblemDetails)
  if ((error.status === 400 || error.status === 422) && err.errors) {
    const firstKey = Object.keys(err.errors)[0];
    const firstMsg = err.errors[firstKey]?.[0] || 'Error de validación';
    return {
      type: 'Validation',
      message: firstMsg,
      status: error.status,
      traceId: err.traceId,
      details: err.errors,
    };
  }

  // 🔸 Conflicto o reglas de negocio
  if (error.status === 409 || error.status === 422) {
    return {
      type: 'Business',
      message: err.detail || err.title || 'Operación no válida.',
      status: error.status,
      traceId: err.traceId,
    };
  }

  // 🔸 Rate limiting
  if (error.status === 429) {
    return {
      type: 'RateLimit',
      message: err.detail || 'Demasiadas solicitudes. Intenta más tarde.',
      status: error.status,
      traceId: err.traceId,
    };
  }

  // 🔸 Texto plano (backend no JSON)
  if (typeof err === 'string') {
    message = err;
  }

  // 🔸 RFC 7807 genérico
  if (err.detail) {
    message = err.detail;
  } else if (err.title) {
    message = err.title;
  }

  return {
    type,
    message,
    status: error.status,
    traceId: err.traceId,
    details: err,
  };
}
