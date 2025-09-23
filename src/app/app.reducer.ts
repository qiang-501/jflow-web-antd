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
import { Valve } from './models/valves';
import { valveReducer } from './services/valve.service';
import { ValveState } from './services/valve.service';
import { menuReducer, MenuState } from './services/reducers/menu.reducer';
export interface AppState {
  workflow: WorkFlow;
  workflows: Array<WorkFlow>;
  valves: ValveState;
  menus: MenuState;
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
  valves: valveReducer,
  menus: menuReducer,
};
export function provideReducer(): EnvironmentProviders {
  return importProvidersFrom(StoreModule.forRoot(reducers, { metaReducers }));
}
