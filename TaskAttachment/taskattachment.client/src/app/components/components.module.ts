import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import standalone components
import { MessageListComponent } from './message-list/message-list.component';
import { ReactionPickerComponent } from './reaction-picker/reaction-picker.component';
import { ReactionListComponent } from './reaction-list/reaction-list.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // Import standalone components
    MessageListComponent,
    ReactionPickerComponent,
    ReactionListComponent,
    ChatComponent
  ],
  exports: [
    // Export standalone components
    MessageListComponent,
    ReactionPickerComponent,
    ReactionListComponent,
    ChatComponent
  ]
})
export class ComponentsModule { }
