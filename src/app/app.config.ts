import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideNzIcons } from './icons-provider';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withInterceptors,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideReducer } from './app.reducer';
import { ValveEffects, MenuEffects, WorkFlowEffects } from './store';
import { UserEffects } from './store/effects/user.effects';
import { RoleEffects } from './store/effects/role.effects';
import { PermissionEffects } from './store/effects/permission.effects';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNzIcons(),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideStore(),
    provideEffects(
      ValveEffects,
      MenuEffects,
      WorkFlowEffects,
      UserEffects,
      RoleEffects,
      PermissionEffects,
    ),
    provideRouterStore(),
    provideReducer(),
  ],
};
