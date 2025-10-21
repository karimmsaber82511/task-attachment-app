import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { AuthService } from './services/auth.service';
import { SignalRService } from './services/signalr.service';
import { ReactionService } from './services/reaction.service';
import { ChatComponent } from './components/chat/chat.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: ChatComponent },
      { path: '**', redirectTo: '' }
    ]),
    ComponentsModule,
    AppComponent
  ],
  providers: [
    AuthService,
    SignalRService,
    ReactionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
