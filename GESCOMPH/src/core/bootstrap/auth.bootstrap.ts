import { APP_INITIALIZER } from '@angular/core';
import { AuthService } from '../security/auth/auth.service';

export function initAuth(auth: AuthService) {
  return () => {
    if (window.location.pathname.includes('/payment-success')) {
      return Promise.resolve(null);
    }
    return auth.GetMe().toPromise()
      .catch(() => auth.RefreshOnly?.().toPromise?.())
      .catch(() => null);
  };
}

export const AUTH_BOOTSTRAP_PROVIDER = {
  provide: APP_INITIALIZER,
  useFactory: initAuth,
  multi: true,
  deps: [AuthService]
};
