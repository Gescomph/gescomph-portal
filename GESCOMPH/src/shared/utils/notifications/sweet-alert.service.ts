import { Injectable } from '@angular/core';
import type { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SweetAlertService {
  private loadingVisible = false;

  private cssVar(name: string, fallback: string): string {
    try {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return v || fallback;
    } catch {
      return fallback;
    }
  }

  /** 🔹 TOAST con animaciones sutiles (fade lateral) */
  public async showNotification(
    title: string,
    text: string,
    icon: SweetAlertIcon
  ): Promise<SweetAlertResult> {
    const { default: Swal } = await import('sweetalert2');
    const fg = this.cssVar('--color-text', '#111827');
    let bg = this.cssVar('--color-surface', '#ffffff');
    let iconColor: string | undefined;

    switch (icon) {
      case 'success':
        bg = this.cssVar('--state-success-bg', bg);
        iconColor = this.cssVar('--state-success', '#16a34a');
        break;
      case 'warning':
        bg = this.cssVar('--state-warning-bg', bg);
        iconColor = this.cssVar('--state-warning', '#eab308');
        break;
      case 'error':
        bg = this.cssVar('--state-error-bg', bg);
        iconColor = this.cssVar('--state-error', '#ef4444');
        break;
      case 'info':
        bg = this.cssVar('--state-info-bg', bg);
        iconColor = this.cssVar('--state-info', '#3b82f6');
        break;
    }

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      background: bg,
      color: fg,
      iconColor,
      showClass: {
        popup: 'animate__animated animate__fadeInRight', // Animación de entrada
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutRight', // Animación de salida
      },
      didOpen: toast => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    return Toast.fire({ title, text, icon });
  }

  /** 🔹 CONFIRM dialog con animaciones suaves de zoom */
  public async showConfirm(
    title: string,
    text: string,
    confirmButtonText = 'Aceptar',
    cancelButtonText = 'Cancelar',
    icon: SweetAlertIcon = 'warning'
  ) {
    const { default: Swal } = await import('sweetalert2');
    const fg = this.cssVar('--color-text', '#111827');
    const bg = this.cssVar('--color-surface', '#ffffff');
    let confirmColor = this.cssVar('--color-primary', '#16a34a');
    const cancelColor = this.cssVar('--gray-400', '#9ca3af');

    switch (icon) {
      case 'success':
        confirmColor = this.cssVar('--state-success', '#16a34a');
        break;
      case 'warning':
        confirmColor = this.cssVar('--state-warning', '#eab308');
        break;
      case 'error':
        confirmColor = this.cssVar('--state-error', '#ef4444');
        break;
      case 'info':
        confirmColor = this.cssVar('--state-info', '#3b82f6');
        break;
    }

    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor: confirmColor,
      cancelButtonColor: cancelColor,
      color: fg,
      background: bg,
      reverseButtons: true,
      focusCancel: true,
      showClass: {
        popup: 'animate__animated animate__zoomIn', // Animación entrada
      },
      hideClass: {
        popup: 'animate__animated animate__zoomOut', // Animación salida
      },
    });
  }

  /** 🔹 Modal de carga bloqueante sin animaciones (evita parpadeo) */
  public async showLoading(title: string, text: string): Promise<void> {
    const { default: Swal } = await import('sweetalert2');
    const fg = this.cssVar('--color-text', '#111827');
    const bg = this.cssVar('--color-surface', '#ffffff');
    this.loadingVisible = true;
    await Swal.fire({
      title,
      text,
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showCancelButton: false,
      color: fg,
      background: bg,
      showClass: { popup: '' },
      hideClass: { popup: '' },
    });
  }

  /** 🔹 Cierra el loading sin afectar los toasts */
  public async hideLoading(): Promise<void> {
    const { default: Swal } = await import('sweetalert2');
    if (this.loadingVisible) {
      this.loadingVisible = false;
      await new Promise(r => setTimeout(r, 100)); // delay para sincronizar con toasts
      Swal.close();
    }
  }

  /** 🔹 Atajos */
  public async success(message: string, title = 'Éxito'): Promise<void> {
    await this.showNotification(title, message, 'success');
  }

  public async error(message: string, title = 'Error'): Promise<void> {
    await this.showNotification(title, message, 'error');
  }

  /** 🔹 Extrae un mensaje legible desde diferentes formas de error */
  private extractErrorMessage(err: unknown, fallback?: string): string {
    try {
      if (typeof err === 'string') return err;
      if (err instanceof Error) return err.message || fallback || 'Ocurrió un error inesperado.';
      const anyErr: any = err;
      if (anyErr?.status === 0) return fallback || 'No hay conexión con el servidor.';

      const errors = anyErr?.error?.errors;
      if (errors && typeof errors === 'object') {
        const msgs: string[] = [];
        for (const key of Object.keys(errors)) {
          const val = errors[key];
          if (Array.isArray(val)) msgs.push(...val);
          else if (typeof val === 'string') msgs.push(val);
        }
        if (msgs.length) return msgs.join('\n');
      }

      const candidates = [
        anyErr?.error?.detail,
        anyErr?.error?.title,
        anyErr?.error?.message,
        anyErr?.message,
        anyErr?.error,
      ].filter(Boolean);

      const first = candidates[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object') return JSON.stringify(first);

      return fallback || 'Ocurrió un error inesperado.';
    } catch {
      return fallback || 'Ocurrió un error inesperado.';
    }
  }

  /** 🔹 Muestra un toast de error estándar a partir de un error HTTP o genérico */
  public async showApiError(
    err: unknown,
    fallbackMessage?: string,
    title = 'Error'
  ): Promise<void> {
    const anyErr: any = err;
    // Si ya es AppError del interceptor → no duplicar
    if (anyErr && typeof anyErr === 'object' && 'type' in anyErr && 'message' in anyErr) return;

    const isValidation = !!anyErr?.error?.errors;
    const is404 = anyErr?.status === 404;
    if (isValidation || is404) return;

    const msg = this.extractErrorMessage(err, fallbackMessage);
    await this.showNotification(title, msg, 'error');
  }
}
