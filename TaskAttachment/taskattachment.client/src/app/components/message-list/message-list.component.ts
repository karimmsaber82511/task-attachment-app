import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message.model';
import { ReactionPickerComponent } from '../reaction-picker/reaction-picker.component';
import { ReactionListComponent } from '../reaction-list/reaction-list.component';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, ReactionPickerComponent, ReactionListComponent],
  template: `
    <div class="message-list">
      <div 
        *ngFor="let message of messages" 
        class="message" 
        [class.current-user]="message.senderId === currentUserId"
      >
        <div class="message-header">
          <span class="username">{{ message.senderUsername }}</span>
          <span class="timestamp">{{ message.timestamp | date:'shortTime' }}</span>
        </div>
        <div class="message-content">{{ message.content }}</div>
        
        <!-- Attachments -->
        <div *ngIf="message.attachments?.length" class="attachments">
          <div *ngFor="let attachment of message.attachments" class="attachment">
            <a [href]="attachment.filePath" target="_blank" class="attachment-link">
              <i class="attachment-icon">📎</i>
              {{ attachment.fileName }}
            </a>
          </div>
        </div>
        
        <!-- Reactions -->
        <div class="message-actions">
          <app-reaction-list 
            *ngIf="message.reactions && message.reactions.length > 0"
            [reactions]="message.reactions || []" 
            [currentUserId]="currentUserId"
            (reactionClick)="onReactionClick($event, message.messageId)">
          </app-reaction-list>
          
          <button class="react-button" (click)="toggleReactionPicker(message.messageId)">
            <i>+</i>
          </button>
        </div>
        
        <!-- Reaction Picker -->
        <app-reaction-picker 
          *ngIf="showPickerFor === message.messageId"
          [messageId]="message.messageId"
          [userId]="currentUserId || 0"
          (reactionSelected)="onReactionSelected($event)">
        </app-reaction-picker>
      </div>
    </div>
  `,
  styles: [`
    .message-list {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }
    
    .message {
      background: #f1f1f1;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      max-width: 80%;
      position: relative;
    }
    
    .message.current-user {
      background: #007bff;
      color: white;
      margin-left: auto;
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.8em;
      margin-bottom: 4px;
      opacity: 0.8;
    }
    
    .message-content {
      word-wrap: break-word;
    }
    
    .message-actions {
      display: flex;
      align-items: center;
      margin-top: 8px;
      gap: 8px;
    }
    
    .react-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 1.2em;
      opacity: 0;
      transition: opacity 0.2s;
      padding: 4px;
      border-radius: 4px;
    }
    
    .message:hover .react-button {
      opacity: 1;
    }
    
    .message.current-user .react-button {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .message.current-user .react-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .attachments {
      margin-top: 8px;
    }
    
    .attachment {
      margin-top: 4px;
    }
    
    .attachment-link {
      color: inherit;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .attachment-icon {
      margin-right: 4px;
    }
  `]
})
export class MessageListComponent {
  @Input() messages: Array<Message & { reactions?: any[] }> = [];
  @Input() currentUserId: number | null = null;
  @Output() reactionSelected = new EventEmitter<{messageId: number, emoji: string}>();
  @Output() reactionClick = new EventEmitter<{messageId: number, emoji: string}>();
  
  showPickerFor: number | null = null;

  toggleReactionPicker(messageId: number): void {
    this.showPickerFor = this.showPickerFor === messageId ? null : messageId;
  }

  onReactionSelected(event: {emoji: string; messageId: number}): void {
    if (this.currentUserId === null) return;
    this.reactionSelected.emit({
      messageId: event.messageId,
      emoji: event.emoji
    });
    this.showPickerFor = null;
  }

  onReactionClick(emoji: string, messageId: number): void {
    this.reactionClick.emit({
      messageId,
      emoji: emoji
    });
  }
}
