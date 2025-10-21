import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reaction } from '../../services/reaction.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-reaction-list',
  template: `
    <div class="reactions-container" *ngIf="reactions && reactions.length > 0">
      <div 
        *ngFor="let group of groupedReactions" 
        class="reaction-group"
        [title]="getReactionUsers(group.emoji)"
        (click)="reactionClick.emit(group.emoji)"
      >
        <span class="emoji">{{ group.emoji }}</span>
        <span class="count" *ngIf="group.count > 1">{{ group.count }}</span>
      </div>
    </div>
  `,
  styles: [`
    .reactions-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }
    
    .reaction-group {
      display: flex;
      align-items: center;
      background: #f0f2f5;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.8rem;
      cursor: default;
    }
    
    .emoji {
      margin-right: 4px;
    }
    
    .count {
      font-size: 0.7rem;
      color: #65676b;
    }
  `]
})
export class ReactionListComponent implements OnChanges {
  @Input() reactions: Reaction[] = [];
  @Output() reactionClick = new EventEmitter<string>();
  @Output() reactionAdded = new EventEmitter<string>();
  @Input() currentUserId: number | null = null;
  
  groupedReactions: { emoji: string; count: number; userReacted: boolean }[] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reactions']) {
      this.groupReactions();
    }
  }

  private groupReactions(): void {
    const groups = new Map<string, { count: number; userReacted: boolean }>();
    
    this.reactions.forEach(reaction => {
      const existing = groups.get(reaction.emoji) || { count: 0, userReacted: false };
      groups.set(reaction.emoji, {
        count: existing.count + 1,
        userReacted: existing.userReacted || (this.currentUserId === reaction.userId)
      });
    });

    this.groupedReactions = Array.from(groups.entries()).map(([emoji, { count, userReacted }]) => ({
      emoji,
      count,
      userReacted
    }));
  }

  getReactionUsers(emoji: string): string {
    const users = this.reactions
      .filter(r => r.emoji === emoji)
      .map(r => r.username || 'Unknown user');
    return users.join('\n');
  }
}
