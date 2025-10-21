import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Set base URL for API calls
const providers = [
  { provide: 'BASE_URL', useValue: environment.apiUrl }
];

if (environment.production) {
  // Enable production mode if needed
  // enableProdMode();
}

platformBrowserDynamic(providers)
  .bootstrapModule(AppModule)
  .catch((err: any) => console.error('Error bootstrapping application:', err));
