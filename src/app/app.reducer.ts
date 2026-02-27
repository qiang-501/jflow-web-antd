import {
  ActionReducerMap,
  StoreModule,
  ActionReducer,
  MetaReducer,
} from '@ngrx/store';
import {
  EnvironmentProviders,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { reducers, AppState } from './store';

// console.log all actions - 仅在开发环境启用
export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.log('state', state);
    console.log('action', action);
    return reducer(state, action);
  };
}

// 根据环境决定是否启用 debug metaReducer
export const metaReducers: MetaReducer<any>[] = isDevMode() ? [debug] : [];

export function provideReducer(): EnvironmentProviders {
  return importProvidersFrom(StoreModule.forRoot(reducers, { metaReducers }));
}

// Re-export AppState for convenience
export type { AppState };
