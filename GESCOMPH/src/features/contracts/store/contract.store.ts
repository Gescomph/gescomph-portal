import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ContractCreateModel, ContractPublicMetricsDto, ContractSelectModel } from '../models/contract.models';
import { ContractService } from '../services/contract/contract.service';

export interface StoreError {
  status?: number;
  code?: string;
  message: string;
}

type UpsertMode = 'append' | 'prepend';

@Injectable({ providedIn: 'root' })
export class ContractStore {

  // ───────────────────────────────────────────
  //  DI
  // ───────────────────────────────────────────
  private readonly svc = inject(ContractService);

  // ───────────────────────────────────────────
  //  STATE: signals crudos
  // ───────────────────────────────────────────
  private readonly _items = signal<ReadonlyArray<ContractSelectModel>>([]);
  private readonly _index = signal<ReadonlyMap<number, number>>(new Map());
  private readonly _loading = signal(false);
  private readonly _error = signal<StoreError | null>(null);
  private readonly _busyIds = signal<ReadonlySet<number>>(new Set());

  //metricas

  private readonly _publicMetrics = signal<ContractPublicMetricsDto | null>(null);
  readonly publicMetrics = computed(() => this._publicMetrics());


  private _lastRequestId = 0;


  // ───────────────────────────────────────────
  //  SELECTORES (solo lectura)
  // ───────────────────────────────────────────
  readonly items = computed(() => this._items());
  readonly rows = this.items;
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly count = computed(() => this._items().length);
  readonly busyIds = computed(() => this._busyIds());

  isBusy(id: number): boolean {
    return this._busyIds().has(id);
  }

  getById(id: number): ContractSelectModel | undefined {
    const i = this._index().get(id);
    return i !== undefined ? this._items()[i] : undefined;
  }


  // ───────────────────────────────────────────
  //  MEMORY ONLY – mutan signals sin HTTP
  // ───────────────────────────────────────────

  private rebuildIndex(list: ReadonlyArray<ContractSelectModel>): void {
    const map = new Map<number, number>();
    for (let i = 0; i < list.length; i++) map.set(list[i].id, i);
    this._index.set(map);
  }

  setAll(list: ContractSelectModel[] | null | undefined): void {
    const arr = (list ?? []).slice();
    this._items.set(arr);
    this.rebuildIndex(arr);
  }

  upsertMany(list: ContractSelectModel[], mode: UpsertMode = 'append'): void {
    if (!list?.length) return;

    this._items.update(curr => {
      const index = this._index();
      const next = curr.slice();
      const fresh: ContractSelectModel[] = [];

      for (const it of list) {
        const pos = index.get(it.id);
        if (pos !== undefined) next[pos] = it;
        else fresh.push(it);
      }

      const merged = mode === 'prepend' ? [...fresh, ...next] : [...next, ...fresh];
      this.rebuildIndex(merged);
      return merged;
    });
  }

  upsertOne(item: ContractSelectModel): void {
    this._items.update(curr => {
      const index = this._index();
      const pos = index.get(item.id);
      if (pos === undefined) {
        const merged = [item, ...curr];
        this.rebuildIndex(merged);
        return merged;
      }
      const copy = curr.slice();
      copy[pos] = item;
      this.rebuildIndex(copy);
      return copy;
    });
  }

  patchOne(id: number, patch: Partial<ContractSelectModel>): void {
    this._items.update(curr => {
      const index = this._index();
      const pos = index.get(id);
      if (pos === undefined) return curr;
      const copy = curr.slice();
      copy[pos] = { ...copy[pos], ...patch };
      this.rebuildIndex(copy);
      return copy;
    });
  }

  patchActiveMany(ids: number[], value: boolean): void {
    if (!ids?.length) return;

    this._items.update(curr => {
      const index = this._index();
      const next = curr.slice();
      let touched = false;

      for (const id of ids) {
        const pos = index.get(id);
        if (pos !== undefined) {
          const row = next[pos];
          if (row.active !== value) {
            next[pos] = { ...row, active: value };
            touched = true;
          }
        }
      }

      if (!touched) return curr;
      this.rebuildIndex(next);
      return next;
    });
  }

  remove(id: number): void {
    this._items.update(curr => {
      const filtered = curr.filter(x => x.id !== id);
      if (filtered.length === curr.length) return curr;
      this.rebuildIndex(filtered);
      return filtered;
    });
  }

  clear(): void {
    this._items.set([]);
    this._index.set(new Map());
    this._error.set(null);
    this._loading.set(false);
    this._busyIds.set(new Set());
  }

  changeActiveStatusLocal(id: number, active: boolean): void {
    this.patchOne(id, { active } as Partial<ContractSelectModel>);
  }

  patchFromDetail(updated: ContractSelectModel): void {
    this.patchOne(updated.id, {
      startDate: updated.startDate,
      endDate: updated.endDate,
      active: updated.active,
    });
  }


  // ───────────────────────────────────────────
  //  INTERNALS (sin IO)
  // ───────────────────────────────────────────
  private markBusy(id: number, val: boolean): void {
    this._busyIds.update(curr => {
      const next = new Set(curr);
      val ? next.add(id) : next.delete(id);
      return next;
    });
  }

  private setError(e: unknown): void {
    const status = (e as any)?.status ?? (e as any)?.statusCode;
    const type = (e as any)?.type;
    if (status === 401 || type === 'Unauthorized' || (e as any)?.__authExpired) return;
    const m = (e as any)?.message ?? (typeof e === 'string' ? e : 'Error inesperado');
    const code = (e as any)?.error?.code ?? (e as any)?.code;
    this._error.set({ status, code, message: String(m) });
  }


  // ───────────────────────────────────────────
  //  DATABASE – IO / HTTP
  // ───────────────────────────────────────────

  async loadPublicMetrics(): Promise<void> {
    try {
      const data = await firstValueFrom(this.svc.getPublicMetrics());
      this._publicMetrics.set(data);
    } catch (e) {
      this.setError(e);
    }
  }

  async loadAll(options: { force?: boolean } = {}): Promise<void> {
    const requestId = ++this._lastRequestId;

    // <<— aqui aplica el force
    if (!options.force && this._items().length > 0) return;

    this._loading.set(true);
    this._error.set(null);

    try {
      const data = await firstValueFrom(this.svc.getAll()); // <<< quita el options de acá
      if (requestId !== this._lastRequestId) return;
      this.setAll(data ?? []);
    } catch (e) {
      if (requestId !== this._lastRequestId) return;
      this.setError(e);
    } finally {
      if (requestId === this._lastRequestId) this._loading.set(false);
    }
  }


  async create(dto: ContractCreateModel): Promise<ContractSelectModel> {
    try {
      const model = await firstValueFrom(this.svc.create(dto));
      this.upsertOne(model);
      return model;
    } catch (e) {
      this.setError(e);
      throw e;
    }
  }

  async update(id: number, dto: Partial<ContractCreateModel>): Promise<void> {
    try {
      const updated = await firstValueFrom(this.svc.update(id, dto));
      this.patchFromDetail(updated);
    } catch (e) {
      this.setError(e);
      throw e;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await firstValueFrom(this.svc.delete(id));
      this.remove(id);
    } catch (e) {
      this.setError(e);
      throw e;
    }
  }

  async deleteLogic(id: number): Promise<void> {
    try {
      await firstValueFrom(this.svc.deleteLogic(id));
      this.remove(id);
    } catch (e) {
      this.setError(e);
      throw e;
    }
  }

  async changeActiveStatusRemote(id: number, active: boolean): Promise<void> {
    if (this.isBusy(id)) return;
    const prev = this.getById(id)?.active;

    this.markBusy(id, true);
    this.changeActiveStatusLocal(id, active);

    try {
      await firstValueFrom(this.svc.changeActiveStatus(id, active));
    } catch (e) {
      if (prev !== undefined) this.changeActiveStatusLocal(id, prev);
      this.setError(e);
      throw e;
    } finally {
      this.markBusy(id, false);
    }
  }
}
