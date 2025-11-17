import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import {
  UserSelectModel,
  UserUpdateModel
} from '../../models/user.models';

import { AuthService } from '../../../../core/security/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { PersonService } from '../../services/person/person.service';
import { RegisterModel } from '../../../auth-login/models/register.models';

@Injectable({ providedIn: 'root' })
export class SecurityUserStore {

  private readonly _users = new BehaviorSubject<UserSelectModel[]>([]);
  readonly users$ = this._users.asObservable();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private personService: PersonService
  ) {
    this.loadAll();
  }

  private get users(): UserSelectModel[] {
    return this._users.getValue();
  }

  private set users(val: UserSelectModel[]) {
    this._users.next(val);
  }

  // =============================================
  // LOAD ALL
  // =============================================
  loadAll(): void {
    this.userService.getAll()
      .pipe(
        tap(users => this.users = users),
        catchError(err => {
          console.error('Error loading users', err);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  // =============================================
  // CREATE (Persona + Usuario + Roles)
  // =============================================
  create(dto: RegisterModel) {
    return this.authService.Register(dto).pipe(
      tap(() => this.loadAll())
    );
  }

  // =============================================
  // UPDATE USER
  // =============================================
  updateUser(id: number, dto: UserUpdateModel): Observable<UserSelectModel> {
    return this.userService.update(id, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  // =============================================
  // UPDATE PERSON
  // =============================================
  updatePerson(id: number, dto: any): Observable<any> {
    return this.personService.update(id, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  // =============================================
  // DELETE
  // =============================================
  delete(id: number): Observable<void> {
    return this.userService.delete(id).pipe(
      tap(() => {
        this.users = this.users.filter(u => u.id !== id);
      })
    );
  }
  // =============================================
  // SOFT DELETE FULL (PATCH /user/:id/soft)
  // =============================================
  deleteLogicFull(id: number) {
    return this.userService.deleteLogicFull(id).pipe(
      tap(() => {
        this.users = this.users.filter(u => u.id !== id);
      }),
      catchError(err => {
        console.error('Error realizando soft delete completo', err);
        return throwError(() => err);
      })
    );
  }


  // =============================================
  // CHANGE ACTIVE
  // =============================================
  changeActiveStatus(id: number, active: boolean) {
    return this.userService.changeActiveStatus(id, active).pipe(
      tap(() => this.loadAll())
    );
  }
}
