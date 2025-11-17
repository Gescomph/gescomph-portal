import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideCloudinaryLoader } from '@angular/common';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { errorInterceptor } from '../core/http/interceptors/error/error.interceptor';
import { csrfInterceptor } from '../core/http/interceptors/security/csrf.interceptor';
import { ngrokCredentialsInterceptor } from '../core/http/interceptors/security/ngrok-credentials.interceptor';

import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  provideAnimations,
} from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';

import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
import { provideClientHydration } from '@angular/platform-browser';
import { authInterceptor } from '../core/http/interceptors/auth/auth.interceptor';
import { AUTH_BOOTSTRAP_PROVIDER } from '../core/bootstrap/auth.bootstrap';

registerLocaleData(localeEsCO);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        csrfInterceptor,
        ...(environment.production ? [] : [ngrokCredentialsInterceptor]),
        errorInterceptor,
        authInterceptor,
      ])
    ),

    AUTH_BOOTSTRAP_PROVIDER,

    provideAnimations(),
    // provideClientHydration(),

    /** Locale y adaptación de fechas */
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },

    /** Cloudinary Loader para imágenes optimizadas */
    provideCloudinaryLoader('https://res.cloudinary.com/dmbndpjlh/'),
  ],
};
