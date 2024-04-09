import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { HammerModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    importProvidersFrom(HammerModule),
    provideAnimations(),
    provideHttpClient()
    // provide the HAMMER_GESTURE_CONFIG token
    // to override the default settings of the HammerModule
    // { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }
  ]
};
