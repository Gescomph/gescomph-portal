import { ApplicationRef, inject, Injectable, NgZone } from '@angular/core';
import { BaseRealtimeService } from '../../../../core/realtime/base/base-realtime.service';
import { ContractStore } from '../../store/contract.store';

type ExpiredPayload = {
  deactivatedIds?: number[];
  counts?: { deactivatedContracts: number; reactivatedEstablishments: number };
  at?: string;
};

@Injectable({ providedIn: 'root' })
export class ContractsRealtimeService extends BaseRealtimeService {
  private readonly store = inject(ContractStore);
  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);

  private refreshing = false;
  private handlersBound = false;

  constructor() {
    super();
  }

  start(): void {
    const wasConnected = !!this.hub;
    if (!wasConnected) {
      super.connect('contracts');
    }
    if (!this.handlersBound && this.hub) {
      this.bindHandlers();
      this.handlersBound = true;
    }
  }

  stop(): void {
    super.disconnect();
    this.handlersBound = false;
  }

  private bindHandlers(): void {
    this.hub!.on('contracts:mutated', (payload: { type: string; id: number; active?: boolean }) => {
      this.zone.run(() => this.handleMutation(payload));
    });

    this.hub!.on('contracts:expired', (payload: ExpiredPayload) => {
      this.zone.run(() => this.handleExpired(payload));
    });

    this.hub!.onreconnected(() => this.zone.run(() => this.refreshAll()));
  }

  private handleMutation(payload: { type: string; id: number; active?: boolean }) {
    switch (payload.type) {
      case 'statusChanged':
        if (payload.id && payload.active !== undefined) {
          this.store.patchOne(payload.id, { active: payload.active });
          this.appRef.tick();
        } else {
          this.refreshAll();
        }
        break;

      case 'deleted':
        if (payload.id) {
          this.store.remove(payload.id);
          this.appRef.tick();
        } else {
          this.refreshAll();
        }
        break;

      case 'created':
        this.refreshAll();
        break;
    }
  }

  private handleExpired(payload: ExpiredPayload) {
    const ids = payload?.deactivatedIds ?? [];
    if (ids.length === 0) return;
    this.store.patchActiveMany(ids, false);
    this.appRef.tick();
  }

  private async refreshAll() {
    if (this.refreshing) return;
    this.refreshing = true;
    try {
      await this.store.loadAll({ force: true });
      this.appRef.tick();
    } finally {
      this.refreshing = false;
    }
  }
}
