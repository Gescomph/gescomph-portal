import { Injectable, signal } from '@angular/core';
import { User } from '../../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  set(user: User | null): void { this._user.set(user); }
  clear(): void { this._user.set(null); }
  get snapshot(): User | null { return this._user(); }
}
