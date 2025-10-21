import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message.model';
import { ReactionService } from '../../services/reaction.service';
import { AuthService } from '../../services/auth.service';
import { SignalRService } from '../../services/signalr.service';
import { Subscription } from 'rxjs';
import { MessageListComponent } from '../message-list/message-list.component';

@Component({
  standalone: true,
  imports: [CommonModule, MessageListComponent],
  selector: 'app-chat',
  template: `
    <div class="chat-container">
      <app-message-list
        [messages]="messages"
        [currentUserId]="currentUserId"
        (reactionSelected)="onMessageReacted($event)">
      </app-message-list>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  currentUserId: number | null = null;
  private signalRSubscription?: Subscription;

  constructor(
    private reactionService: ReactionService,
    private authService: AuthService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id || null;
    });

    // Load initial messages
    this.loadMessages();

    // Subscribe to real-time reaction events
    this.signalRSubscription = this.signalRService.reactionEvent$.subscribe(
      event => this.handleReactionEvent(event)
    );
  }

  ngOnDestroy(): void {
    this.signalRSubscription?.unsubscribe();
  }

  private loadMessages(): void {
    // TODO: Load messages from your API
    // Example:
    // this.chatService.getMessages().subscribe(messages => {
    //   this.messages = messages;
    // });
  }

  async onMessageReacted(event: { messageId: number; emoji: string }): Promise<void> {
    if (!this.currentUserId) return;

    try {
      await this.reactionService.addReaction({
        messageId: event.messageId,
        userId: this.currentUserId,
        emoji: event.emoji
      }).toPromise();
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  }

  private handleReactionEvent(event: any): void {
    const message = this.messages.find(m => m.messageId === event.messageId);
    if (!message) return;

    if (!message.reactions) {
      message.reactions = [];
    }

    if (event.action === 'added') {
      // Check if reaction already exists
      const existingIndex = message.reactions.findIndex(
        r => r.userId === event.userId && r.emoji === event.emoji
      );

      if (existingIndex === -1) {
        message.reactions.push({
          reactionId: event.reactionId,
          messageId: event.messageId,
          userId: event.userId,
          username: event.username,
          emoji: event.emoji,
          createdAt: new Date(event.createdAt)
        });
      }
    } else if (event.action === 'removed') {
      message.reactions = message.reactions.filter(
        r => !(r.userId === event.userId && r.emoji === event.emoji)
      );
    }

    // Trigger change detection
    this.messages = [...this.messages];
  }
}
