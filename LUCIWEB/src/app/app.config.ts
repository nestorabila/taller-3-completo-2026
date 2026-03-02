import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { InterceptorService } from './servicio/interceptor.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // ✅ CORRECTO

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // ✅ CORREGIDO
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
         options: {
          darkModeSelector: '.dark'  // esto indica que cuando tu <html> o <body> tiene la clase 'dark', PrimeNG cambie al modo oscuro.
        }
      }
    })
  ]
};


