import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private messageReceivedSubject = new Subject<{ 
    username: string; 
    message: string; 
    timestamp: Date;
    attachments?: Array<{ id: string; name: string; type: string; url: string }> 
  }>();
  
  public messageReceived$ = this.messageReceivedSubject.asObservable();
  
  private connectionStatusSubject = new Subject<boolean>();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private apiUrl = 'https://localhost:7276/api';

  constructor(private http: HttpClient) {}

  public startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7276/chathub', {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.onreconnecting(() => {
      console.log('Reconnecting to SignalR hub...');
      this.connectionStatusSubject.next(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('Reconnected to SignalR hub');
      this.connectionStatusSubject.next(true);
    });

    this.hubConnection.onclose(() => {
      console.log('Connection closed');
      this.connectionStatusSubject.next(false);
    });

    return this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection started');
        this.connectionStatusSubject.next(true);
        this.registerMessageHandler();
      })
      .catch(err => {
        console.error('Error starting SignalR connection: ', err);
        this.connectionStatusSubject.next(false);
        throw err;
      });
  }

  private registerMessageHandler(): void {
    this.hubConnection.on('ReceiveMessage', (username: string, message: string, timestamp: string, attachments: any[] = []) => {
      console.log('Message received:', { username, message, timestamp, attachments });
      this.messageReceivedSubject.next({
        username,
        message,
        timestamp: new Date(timestamp),
        attachments: attachments?.map(att => ({
          id: att.id,
          name: att.fileName,
          type: att.fileType,
          url: `${this.apiUrl}/files/download/${att.id}`
        }))
      });
    });
  }

  public sendMessage(message: string, attachmentIds: string[] = []): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return Promise.reject('Not connected to SignalR hub');
    }

    return this.hubConnection.invoke('SendMessage', message, attachmentIds)
      .catch(err => {
        console.error('Error sending message: ', err);
        throw err;
      });
  }

  public uploadFile(file: File): Promise<{ id: string; name: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ id: string; fileName: string; fileType: string }>(
      `${this.apiUrl}/files/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).toPromise()
    .then((response: any) => ({
      id: response.id,
      name: response.fileName,
      type: response.fileType
    }))
    .catch(error => {
      console.error('Error uploading file:', error);
      throw error;
    });
  }

  public stopConnection(): Promise<void> {
    if (this.hubConnection) {
      return this.hubConnection.stop();
    }
    return Promise.resolve();
  }

  public isConnected(): boolean {
    return this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected;
  }
}
