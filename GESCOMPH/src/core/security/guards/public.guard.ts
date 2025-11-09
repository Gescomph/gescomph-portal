import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../permission/user.store';

export const publicGuard: CanActivateFn = () => {
  const store = inject(UserStore);
  const router = inject(Router);

  return store.snapshot
    ? router.createUrlTree(['/dashboard'])
    : true;
};
