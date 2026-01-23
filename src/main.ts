/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from './app/core/services';
import { FakeBackendInterceptor } from './app/core/interceptors';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptors([FakeBackendInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslationService,
          deps: [HttpClient],
        },
      }),
    ),
  ],
}).catch((e: Error) => console.error(e));
