import {
  ApplicationConfig,
  importProvidersFrom,
  APP_INITIALIZER,
} from '@angular/core';
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
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { initializePermissions } from './core/initializers/permission.initializer';
import { PermissionService } from './core/services/permission.service';
import { AuthService } from './core/services/auth.service';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNzIcons(),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // 应用启动时初始化权限缓存
    {
      provide: APP_INITIALIZER,
      useFactory: initializePermissions,
      deps: [PermissionService, AuthService],
      multi: true,
    },
  ],
};
