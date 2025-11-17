import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseRealtimeService {
   protected hub?: signalR.HubConnection;

  protected createHub(hubName: string): signalR.HubConnection {
    return new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiURL}/hubs/${hubName}`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();
  }

  connect(hubName: string): void {
    if (this.hub) return;
    this.hub = this.createHub(hubName);
    this.hub.start().catch(console.error);
  }

  disconnect(): void {
    this.hub?.stop().catch(() => void 0);
    this.hub = undefined;
  }
}
