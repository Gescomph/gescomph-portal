import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  EstablishmentSelect,
  EstablishmentCreate,
  EstablishmentUpdate,
  EstablishmentCard,
  GetAllOptions
} from '../../models/establishment.models';
import { EstablishmentService } from '../../services/establishment/establishment.service';
import { ImageModel } from '../../models/images.models';

@Injectable({ providedIn: 'root' })
export class EstablishmentStore {
  // Servicio de datos
  private readonly establishmentService = inject(EstablishmentService);

  // Estado base (UI)
  private readonly _items = signal<EstablishmentSelect[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Estado para cards livianos
  private readonly _cards = signal<EstablishmentCard[]>([]);
  private readonly _cardsLoading = signal(false);
  private readonly _cardsError = signal<string | null>(null);

  /** true = la vista sólo mostrará activos (filtro de UI, no del backend) */
  private readonly _activeOnlyView = signal(false);

  // Selectores (derivados)
  readonly items = computed(() => this._items()); // todos
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly count = computed(() => this._items().length);

  // Cards (livianos)
  readonly cards = computed(() => this._cards());
  readonly cardsLoading = computed(() => this._cardsLoading());
  readonly cardsError = computed(() => this._cardsError());

  /** Vista filtrada según activeOnlyView (para usar en tablas) */
  readonly view = computed(() => {
    const onlyActive = this._activeOnlyView();
    return this._items().filter(e => (onlyActive ? e.active : true));
  });

  // Configuración de vista
  setActiveOnlyView(flag: boolean): void {
    this._activeOnlyView.set(!!flag);
  }

  // Operaciones de colección (UI)
  setAll(list: EstablishmentSelect[]): void {
    this._items.set(list ?? []);
  }

  setCards(list: EstablishmentCard[]): void {
    this._cards.set(list ?? []);
  }

  upsertMany(list: EstablishmentSelect[]): void {
    const map = new Map(this._items().map(x => [x.id, x]));
    for (const it of list ?? []) map.set(it.id, it);
    this._items.set(Array.from(map.values()));
  }

  upsertOne(item: EstablishmentSelect): void {
    this._items.update(arr => {
      const i = arr.findIndex(x => x.id === item.id);
      if (i === -1) return [item, ...arr];
      const copy = arr.slice();
      copy[i] = item;
      return copy;
    });
  }

  remove(id: number): void {
    this._items.update(arr => arr.filter(x => x.id !== id));
  }

  clear(): void {
    this._items.set([]);
    this._error.set(null);
    this._loading.set(false);
    this._cards.set([]);
    this._cardsError.set(null);
    this._cardsLoading.set(false);
  }

  changeActiveStatus(id: number, active: boolean): void {
    this._items.update(arr => arr.map(x => (x.id === id ? { ...x, active } : x)));
  }

  applyImages(establishmentId: number, images: ImageModel[]): void {
    this._items.update(arr =>
      arr.map(e =>
        e.id === establishmentId
          ? { ...e, images: [...(e.images ?? []), ...(images ?? [])] }
          : e
      )
    );
  }

  removeMany(ids: number[]): void {
    const set = new Set(ids ?? []);
    this._items.update(arr => arr.filter(e => !set.has(e.id)));
  }

  patchActiveMany(ids: number[], active: boolean): void {
    const set = new Set(ids ?? []);
    this._items.update(arr => arr.map(e => (set.has(e.id) ? { ...e, active } : e)));
  }

  patchActiveOne(id: number, active: boolean): void {
    this.changeActiveStatus(id, active);
  }

  // I/O (async; el servicio hace HTTP)
  /** Carga inicial; si quieres filtrar en el backend, ajusta aquí. */
  async loadAll(options?: GetAllOptions): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const data = await firstValueFrom(this.establishmentService.getAll(options));
      this.setAll(data ?? []);
    } catch (e: any) {
      const status = e?.status ?? e?.statusCode;
      const type = e?.type;
      if (status === 401 || type === 'Unauthorized' || e?.__authExpired) return; // evitar banner al expirar sesión
      this._error.set(String(e?.message ?? e));
    } finally {
      this._loading.set(false);
    }
  }

  /** Carga cards livianos desde /Establishments/cards */
  async loadCardsAll(activeOnly = true): Promise<void> {
    this._cardsLoading.set(true);
    this._cardsError.set(null);
    try {
      const obs = activeOnly
        ? this.establishmentService.getCardsActive()
        : this.establishmentService.getCardsAny();
      const data = await firstValueFrom(obs);
      this.setCards(data ?? []);
    } catch (e: any) {
      const status = e?.status ?? e?.statusCode;
      const type = e?.type;
      if (status === 401 || type === 'Unauthorized' || e?.__authExpired) return;
      this._cardsError.set(String(e?.message ?? e));
    } finally {
      this._cardsLoading.set(false);
    }
  }

  async getById(id: number): Promise<EstablishmentSelect | null> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const entity = await firstValueFrom(this.establishmentService.getById(id));
      if (entity) {
        this.upsertOne(entity);
        return entity;
      }
      return null;
    } catch (e: any) {
      const status = e?.status ?? e?.statusCode;
      const type = e?.type;
      if (status === 401 || type === 'Unauthorized' || e?.__authExpired) return null;
      this._error.set(String(e?.message ?? e));
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async create(dto: EstablishmentCreate): Promise<void> {
    const created = await firstValueFrom(this.establishmentService.create(dto));
    this.upsertOne(created);
  }

  async update(dto: EstablishmentUpdate): Promise<void> {
    const updated = await firstValueFrom(this.establishmentService.update(dto));
    this.upsertOne(updated);
  }

  async delete(id: number): Promise<void> {
    await firstValueFrom(this.establishmentService.delete(id));
    this.remove(id);
  }

  /** Si tu API implementa “borrado lógico” */
  async deleteLogic(id: number): Promise<void> {
    await firstValueFrom(this.establishmentService.deleteLogic(id));
    // si la API no devuelve la entidad actualizada, podrías marcarlo inactivo:
    this.changeActiveStatus(id, false);
  }

  /** Cambia active en backend; si retorna la entidad, mejor upsert */
  async changeActiveStatusRemote(id: number, active: boolean): Promise<void> {
    // Optimista
    const prev = this.items().find(x => x.id === id)?.active ?? null;
    this.changeActiveStatus(id, active);

    try {
      const updated = await firstValueFrom(
        this.establishmentService.changeActiveStatus(id, active)
      );
      this.upsertOne(updated);
    } catch (err) {
      if (prev !== null) this.changeActiveStatus(id, prev);
      throw err;
    }
  }


  async loadByPlaza(plazaId: number, options?: GetAllOptions): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const data = await firstValueFrom(this.establishmentService.getByPlaza(plazaId, options));
      this.setAll(data ?? []);
    } catch (e: any) {
      const status = e?.status ?? e?.statusCode;
      const type = e?.type;
      if (status === 401 || type === 'Unauthorized' || e?.__authExpired) return;
      this._error.set(String(e?.message ?? e));
    } finally {
      this._loading.set(false);
    }
  }

  async loadCardsByPlaza(plazaId: number, activeOnly = true): Promise<void> {
    this._cardsLoading.set(true);
    this._cardsError.set(null);

    try {
      const data = await firstValueFrom(
        this.establishmentService.getCardsByPlaza(plazaId, { activeOnly })
      );
      this.setCards(data ?? []);
    } catch (e: any) {
      const status = e?.status ?? e?.statusCode;
      const type = e?.type;
      if (status === 401 || type === 'Unauthorized' || e?.__authExpired) return;
      this._cardsError.set(String(e?.message ?? e));
    } finally {
      this._cardsLoading.set(false);
    }
  }


}
