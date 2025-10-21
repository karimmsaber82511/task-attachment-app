import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  username: string;
  // Add other user properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize with a default user for demo purposes
    // In a real app, you would get this from your auth system
    this.currentUserSubject.next({
      id: 1,
      username: 'current_user'
    });
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Add your authentication methods here
  // login(), logout(), isAuthenticated(), etc.
}
