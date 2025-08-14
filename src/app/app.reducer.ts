import {
  ActionReducerMap,
  StoreModule,
  ActionReducer,
  MetaReducer,
} from '@ngrx/store';
import {
  workFlowReducer,
  workFlowsReducer,
} from './services/work-flow.service';
import { WorkFlow } from './models/work-flow';
import { EnvironmentProviders, importProvidersFrom } from '@angular/core';

export interface AppState {
  workflow: WorkFlow;
  workflows: Array<WorkFlow>;
}

// console.log all actions
export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.log('state', state);
    console.log('action', action);

    return reducer(state, action);
  };
}
export const metaReducers: MetaReducer<any>[] = [debug];
export let reducers: ActionReducerMap<AppState> = {
  workflow: workFlowReducer,
  workflows: workFlowsReducer,
};
export function provideReducer(): EnvironmentProviders {
  return importProvidersFrom(StoreModule.forRoot(reducers, { metaReducers }));
}
