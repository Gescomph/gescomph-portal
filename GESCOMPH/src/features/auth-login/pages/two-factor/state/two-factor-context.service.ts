import { Injectable, signal } from '@angular/core';
import type { TwoFactorChallenge } from '../../../../../core/security/auth/auth.models';

@Injectable({ providedIn: 'root' })
export class TwoFactorContextService {
  private readonly _challenge = signal<TwoFactorChallenge | null>(null);
  readonly challenge = this._challenge.asReadonly();

  setChallenge(challenge: TwoFactorChallenge): void {
    this._challenge.set(challenge);
  }

  clear(): void {
    this._challenge.set(null);
  }
}
