import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, IRetryPolicy, HttpTransportType } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';

export interface ReactionEvent {
  messageId: number;
  userId: number;
  username: string;
  emoji: string;
  action: 'added' | 'removed';
}

class CustomRetryPolicy implements IRetryPolicy {
  constructor(private maxRetries: number = 5, private initialDelayMs: number = 2000) {}

  nextRetryDelayInMilliseconds(retryContext: any): number | null {
    if (retryContext.elapsedMilliseconds < 60000) { // 1 minute of quick retries
      return Math.min(10000, this.initialDelayMs * Math.pow(2, retryContext.previousRetryCount));
    }
    // After 1 minute, slow down to every 30 seconds
    return 30000;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection;
  private _reactionEvent$ = new Subject<ReactionEvent>();
  private _connectionEstablished$ = new BehaviorSubject<boolean>(false);
  private _isInitialized = false;
  private _reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly RECONNECT_INTERVAL = 5000; // 5 seconds

  public reactionEvent$ = this._reactionEvent$.asObservable();
  public connectionEstablished$ = this._connectionEstablished$.asObservable();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    if (this._isInitialized) return;
    
    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}/reactionHub`, {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect(new CustomRetryPolicy())
        .build();

      this.registerOnServerEvents();
      this.startConnection();
      this._isInitialized = true;
    } catch (error) {
      console.error('Error initializing SignalR connection:', error);
      this._connectionEstablished$.next(false);
    }
  }

  private async startConnection() {
    if (this.hubConnection?.state === 'Connected') return;

    try {
      await this.hubConnection.start();
      console.log('SignalR connection started');
      this._connectionEstablished$.next(true);
      this._reconnectAttempts = 0;
    } catch (err) {
      console.error('Error while starting SignalR connection:', err);
      this._connectionEstablished$.next(false);
      
      // Exponential backoff for reconnection attempts
      const delay = Math.min(30000, 1000 * Math.pow(2, this._reconnectAttempts));
      this._reconnectAttempts++;
      
      if (this._reconnectAttempts <= this.MAX_RECONNECT_ATTEMPTS) {
        console.log(`Reconnection attempt ${this._reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
        setTimeout(() => this.startConnection(), delay);
      } else {
        console.error('Max reconnection attempts reached. Please check your network connection and server status.');
      }
    }
  }

  private registerOnServerEvents(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReactionAdded', (event: ReactionEvent) => {
      this._reactionEvent$.next({
        ...event,
        action: 'added'
      });
    });

    this.hubConnection.on('ReactionRemoved', (event: ReactionEvent) => {
      this._reactionEvent$.next({
        ...event,
        action: 'removed'
      });
    });

    this.hubConnection.onclose(error => {
      console.log('SignalR connection closed', error);
      this._connectionEstablished$.next(false);
      if (!error) {
        this.startConnection();
      }
    });
  }

  public async joinRoom(roomId: string): Promise<void> {
    if (!this.isConnected()) {
      await this.startConnection();
    }
    
    try {
      await this.hubConnection.invoke('JoinRoom', roomId);
    } catch (err) {
      console.error('Error joining room:', err);
      throw err;
    }
  }

  public async leaveRoom(roomId: string): Promise<void> {
    if (!this.isConnected()) return;
    
    try {
      await this.hubConnection.invoke('LeaveRoom', roomId);
    } catch (err) {
      console.error('Error leaving room:', err);
      throw err;
    }
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  public getConnectionState(): string {
    return this.hubConnection?.state || 'Disconnected';
  }
}
