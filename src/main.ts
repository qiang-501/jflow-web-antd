import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
// import { AppReducerModule } from './app/app.reducer';

ModuleRegistry.registerModules([AllCommunityModule]);
bootstrapApplication(AppComponent, appConfig).catch((e) => console.error(e));
