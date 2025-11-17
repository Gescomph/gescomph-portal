import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../permission/user.store';

export const authGuard: CanActivateFn = () => {
  const store = inject(UserStore);
  const router = inject(Router);

  return store.snapshot
    ? true
    : router.createUrlTree(['/auth/login']);
};
