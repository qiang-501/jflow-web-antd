import { createReducer, on } from '@ngrx/store';

export interface ValveState {
  valves: any;
}

export const initialState: ValveState = {
  valves: null,
};

export const valveReducer = createReducer(
  initialState,
  // 处理 ValvesLoadedSuccess Action
  on({ type: 'ValvesLoadedSuccess' } as any, (state, action) => ({
    ...state,
    valves: action.payload,
  }))
);
