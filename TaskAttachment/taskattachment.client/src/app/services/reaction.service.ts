import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Reaction {
  reactionId?: number;
  messageId: number;
  userId: number;
  username?: string;
  emoji: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReactionService {
  private apiUrl = `${environment.apiUrl}/api/reactions`;

  constructor(
    private http: HttpClient
    // signalRService can be added back when implementing real-time updates
  ) { }

  getMessageReactions(messageId: number): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(`${this.apiUrl}/message/${messageId}`).pipe(
      catchError(error => {
        console.error('Error getting reactions:', error);
        return of([]);
      })
    );
  }

  addReaction(reaction: Partial<Reaction>): Observable<Reaction> {
    return this.http.post<Reaction>(this.apiUrl, reaction).pipe(
      tap(() => {
        // The SignalR hub will handle broadcasting to other clients
      }),
      catchError(error => {
        console.error('Error adding reaction:', error);
        throw error;
      })
    );
  }

  removeReaction(reactionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reactionId}`).pipe(
      catchError(error => {
        console.error('Error removing reaction:', error);
        throw error;
      })
    );
  }
}
