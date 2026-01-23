import {
  ActionReducerMap,
  StoreModule,
  ActionReducer,
  MetaReducer,
} from '@ngrx/store';
import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { reducers, AppState } from './store';

// console.log all actions
export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.log('state', state);
    console.log('action', action);
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<any>[] = [debug];

export function provideReducer(): EnvironmentProviders {
  return importProvidersFrom(StoreModule.forRoot(reducers, { metaReducers }));
}

// Re-export AppState for convenience
export type { AppState };
