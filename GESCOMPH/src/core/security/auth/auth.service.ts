// core/security/auth/auth.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../../shared/models/user.model';
import { UserStore } from '../permission/user.store';
import { ChangePasswordDto } from '../../models/auth/change-password.models';
import { REQ_AUTH_HEADER, SKIP_REFRESH_HEADER } from '../../../shared/var/http.constants';
import {
  AuthLoginCredentials,
  AuthLoginResponse,
  TwoFactorConfirmResponse,
  TwoFactorResendRequest,
  TwoFactorResendResponse,
  TwoFactorVerifyRequest,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userStore = inject(UserStore);
  private urlBase = environment.apiURL + '/auth';

  private authedHeaders() { return new HttpHeaders({ [REQ_AUTH_HEADER]: '1' }); }
  private skipRefreshHeaders() { return new HttpHeaders({ [REQ_AUTH_HEADER]: '1', [SKIP_REFRESH_HEADER]: '1' }); }

  Register(obj: any) {
    return this.http.post<any>(`${this.urlBase}/register`, obj, { withCredentials: true });
  }

  Login(credentials: AuthLoginCredentials) {
    return this.http
      .post<AuthLoginResponse>(`${this.urlBase}/login`, credentials, { withCredentials: true })
      .pipe(
        switchMap(response =>
          response.requiresTwoFactor
            ? of(response)
            : this.GetMe().pipe(map(() => response))
        )
      );
  }

  ConfirmTwoFactor(dto: TwoFactorVerifyRequest) {
    return this.http
      .post<TwoFactorConfirmResponse>(`${this.urlBase}/confirmar-2fa`, dto, { withCredentials: true })
      .pipe(
        switchMap(response => this.GetMe().pipe(map(() => response)))
      );
  }

  ResendTwoFactorCode(dto: TwoFactorResendRequest) {
    return this.http.post<TwoFactorResendResponse>(
      `${this.urlBase}/reenviar-2fa`,
      dto,
      { withCredentials: true }
    );
  }

  ToggleTwoFactor(enabled: boolean) {
    return this.http.post(
      `${this.urlBase}/two-factor`,
      { enabled },
      {
        withCredentials: true,
        headers: this.authedHeaders()
      }
    );
  }

  GetMe() {
    return this.http.get<User>(`${this.urlBase}/me`, {
      withCredentials: true, headers: this.authedHeaders()
    }).pipe(tap(u => this.userStore.set(u)));
  }

  /** Solo refresh. La rehidratación la hace el coordinador (o quien llame). */
  RefreshOnly() {
    return this.http.post(`${this.urlBase}/refresh`, {}, {
      withCredentials: true, headers: this.skipRefreshHeaders()
    });
  }

  /** Usado por el coordinador para rehidratar tras refresh sin disparar otro refresh. */
  ReloadMeSkipRefresh() {
    return this.http.get<User>(`${this.urlBase}/me`, {
      withCredentials: true, headers: this.skipRefreshHeaders()
    }).pipe(tap(u => this.userStore.set(u)));
  }

  logout() {
    return this.http.post(`${this.urlBase}/logout`, {}, {
      withCredentials: true, headers: this.authedHeaders()
    }).pipe(tap(() => {
      this.userStore.clear();
      this.router.navigate(['/']);
    }));
  }
  ChangePassword(dto: ChangePasswordDto): Observable<any> {
    return this.http.post(
      environment.apiURL + '/change-password',
      dto,
      { withCredentials: true }
    );
  }

  RequestPasswordReset(email: string): Observable<any> {
    return this.http.post(this.urlBase + '/recuperar/enviar-codigo', { email });
  }

  ConfirmPasswordReset(params: { email: string; code: string; newPassword: string }): Observable<any> {
    return this.http.post(this.urlBase + '/recuperar/confirmar', params);
  }
}

