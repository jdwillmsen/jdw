import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ENVIRONMENT } from '@jdw/angular-container-util';
import { provideHttpClient } from '@angular/common/http';
import config from '../config.json';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    provideRouter(appRoutes),
    {
      provide: ENVIRONMENT,
      useValue: config,
    },
  ],
};
