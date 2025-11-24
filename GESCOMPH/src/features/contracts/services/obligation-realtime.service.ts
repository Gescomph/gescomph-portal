import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseRealtimeService } from '../../../core/realtime/base/base-realtime.service';

@Injectable({
    providedIn: 'root'
})
export class ObligationRealtimeService extends BaseRealtimeService {
    private readonly obligationsUpdatedSubject = new Subject<void>();

    // Observable que los componentes pueden suscribirse
    public readonly obligationsUpdated$ = this.obligationsUpdatedSubject.asObservable();

    constructor() {
        super();
    }

    public startConnection(): void {
        // Conectar al hub 'obligations' (definido en Program.cs del backend)
        this.connect('obligations');

        if (this.hub) {
            // Escuchar el evento que definimos en el backend
            this.hub.on('ObligationsUpdated', () => {
                console.log('[SignalR] ObligationsUpdated received');
                this.obligationsUpdatedSubject.next();
            });
        }
    }

    public stopConnection(): void {
        this.disconnect();
    }
}
