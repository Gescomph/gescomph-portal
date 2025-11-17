import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ModuleCreateModel, ModuleSelectModel, ModuleUpdateModel } from '../../models/module.models';
import { ModuleService } from '../../services/module/module.service';

@Injectable({
  providedIn: 'root'
})
export class ModuleStore {
  private readonly _modules = new BehaviorSubject<ModuleSelectModel[]>([]);
  readonly modules$ = this._modules.asObservable();
  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();
  private readonly _error = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error.asObservable();

  constructor(private moduleService: ModuleService) {
    this.loadAll();
  }

  private get modules(): ModuleSelectModel[] {
    return this._modules.getValue();
  }

  private set modules(val: ModuleSelectModel[]) {
    this._modules.next(val);
  }

  private startLoading(): void {
    this._loading.next(true);
    this._error.next(null);
  }

  loadAll() {
    this.startLoading();

    this.moduleService.getAll().pipe(
      tap(data => this.modules = data),
      catchError(err => {
        console.error('Error loading modules', err);
        this._error.next(err?.message ?? 'Error al cargar módulos');
        return throwError(() => err);
      }),
      finalize(() => this._loading.next(false))
    ).subscribe();
  }

  create(module: ModuleCreateModel): Observable<ModuleSelectModel> {
    return this.moduleService.create(module).pipe(
      tap(() => {
        this.loadAll(); // Force refresh
      })
    );
  }

  update(id: number, updateDto: ModuleUpdateModel): Observable<ModuleSelectModel> {
    return this.moduleService.update(id, updateDto).pipe(
      tap(() => {
        this.loadAll(); // Force refresh
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.moduleService.delete(id).pipe(
      tap(() => {
        this.modules = this.modules.filter(c => c.id !== id);
      })
    );
  }

  deleteLogic(id: number): Observable<void> {
    return this.moduleService.deleteLogic(id).pipe(
      tap(() => {
        this.loadAll(); // Force refresh
      })
    );
  }
  changeActiveStatus(id: number, active: boolean): Observable<ModuleSelectModel> {
    return this.moduleService.changeActiveStatus(id, active).pipe(
      tap(() => {
        this.loadAll(); // Force refresh
      })
    );
  }
}
