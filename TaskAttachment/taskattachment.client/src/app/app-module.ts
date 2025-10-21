import { CommonModule, DatePipe } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app-routing-module';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { UserService } from './services/user.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('An error occurred:', error);
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: 'BASE_URL', useValue: 'https://localhost:7276' },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    UserService,
    MessageService,
    ChatService,
    DatePipe
  ]
}).catch(err => console.error(err));

// This is kept for backward compatibility
@NgModule({
  imports: [BrowserModule, FormsModule, CommonModule],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    UserService,
    MessageService,
    ChatService,
    DatePipe,
    { provide: 'BASE_URL', useValue: 'https://localhost:7276' }
  ]
})
export class AppModule { }
