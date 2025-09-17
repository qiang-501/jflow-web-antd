/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslationService } from './app/services/translation/translationService';
import { FakeBackendInterceptor } from './app/fakes/fake-backend';
ModuleRegistry.registerModules([AllCommunityModule]);
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslationService,
          deps: [HttpClient],
        },
      })
    ),
    importProvidersFrom(FakeBackendInterceptor),
  ],
}).catch((e) => console.error(e));
