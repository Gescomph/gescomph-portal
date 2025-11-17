// core/http/csrf.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { CSRF_COOKIE, CSRF_HEADER } from '../../../../shared/var/http.constants';

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrf = getCookie(CSRF_COOKIE);
  req = req.clone({
    withCredentials: true,
    setHeaders: csrf ? { [CSRF_HEADER]: csrf } : {}
  });
  return next(req);
};
