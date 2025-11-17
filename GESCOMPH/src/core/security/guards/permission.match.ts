import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { User } from '../../../shared/models/user.model';
import { normalizeUrl } from '../../utils/url-normalize';
import { UserStore } from '../permission/user.store';
import { AuthService } from '../auth/auth.service';

export const permissionMatchGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const userStore = inject(UserStore);

  const full = normalizeUrl('/' + segments.map(s => s.path).join('/'));

  const can = (u: User | null): boolean => {
    if (!u?.menu?.length) return false;
    const allowed = new Set((u.menu ?? []).flatMap(m => (m.forms ?? []).map(f => f.route)));
    let curr = '';
    for (const seg of full.split('/').filter(Boolean)) {
      curr = curr ? `${curr}/${seg}` : seg;
      if (allowed.has(curr)) return true;
    }
    return false;
  };

  // Siempre valida sesión contra backend antes de resolver permisos
  return auth.GetMe().pipe(
    map(u => {
      if (!u) return router.parseUrl('/auth/login');
      userStore.set(u);
      return can(u) || router.parseUrl('/auth/login');
    }),
    catchError(() => of(router.parseUrl('/auth/login')))
  );
};
