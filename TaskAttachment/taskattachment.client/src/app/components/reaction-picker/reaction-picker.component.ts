import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reaction-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reaction-picker">
      <button 
        *ngFor="let emoji of emojis" 
        (click)="onSelectEmoji(emoji)"
        class="emoji-button"
        type="button"
        [title]="emoji"
      >
        {{ emoji }}
      </button>
    </div>
  `,
  styles: [`
    .reaction-picker {
      display: flex;
      gap: 4px;
      background: white;
      border-radius: 16px;
      padding: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .emoji-button {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 12px;
      transition: background-color 0.2s;
    }
    
    .emoji-button:hover {
      background-color: #f0f2f5;
    }
  `]
})
export class ReactionPickerComponent {
  @Input() messageId: number = 0;
  @Input() userId: number = 0;
  @Output() reactionSelected = new EventEmitter<{emoji: string; messageId: number}>();

  emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  onSelectEmoji(emoji: string): void {
    this.reactionSelected.emit({
      emoji,
      messageId: this.messageId
    });
  }
}
