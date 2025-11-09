// core/security/auth/auth.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../../shared/models/user.model';
import { UserStore } from '../permission/user.store';
import { ChangePasswordDto } from '../../models/auth/change-password.models';
import { REQ_AUTH_HEADER, SKIP_REFRESH_HEADER } from '../../../shared/var/http.constants';

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

  Login(obj: any) {
    return this.http.post<any>(`${this.urlBase}/login`, obj, { withCredentials: true })
      .pipe(switchMap(() => this.GetMe())); // /me riega el store
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
      environment.apiURL + '/auth/change-password',
      dto,
      { withCredentials: true }
    );
  }

  RequestPasswordReset(email: string): Observable<any> {
    return this.http.post(this.urlBase + 'recuperar/enviar-codigo', { email });
  }

  ConfirmPasswordReset(params: { email: string; code: string; newPassword: string }): Observable<any> {
    return this.http.post(this.urlBase + 'recuperar/confirmar', params);
  }
}

