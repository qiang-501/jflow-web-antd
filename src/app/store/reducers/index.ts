import { ActionReducerMap } from '@ngrx/store';
import { WorkFlowState, workFlowReducer } from './workflow.reducer';
import { ValveState, valveReducer } from './valve.reducer';
import { MenuState, menuReducer } from './menu.reducer';

export interface AppState {
  workflows: WorkFlowState;
  valves: ValveState;
  menus: MenuState;
}

export const reducers: ActionReducerMap<AppState> = {
  workflows: workFlowReducer,
  valves: valveReducer,
  menus: menuReducer,
};

export type { WorkFlowState, ValveState, MenuState };
