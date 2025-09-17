import { createReducer, on } from '@ngrx/store';

export interface ValveState {
  valves: any;
  loading: boolean;
  error: any;
}

export const initialState: ValveState = {
  valves: [],
  loading: false,
  error: null,
};

export const valveReducer = createReducer(
  initialState,
  // 处理 ValvesLoadedSuccess Action
  on({ type: 'ValvesLoadedSuccess' } as any, (state, action) => ({
    ...state,
    valves: action.payload,
    loading: false,
  })),
  on({ type: 'ValvesLoadedError' } as any, (state, action) => ({
    ...state,
    valves: [],
    error: action.payload,
    loading: false,
  })),
  on({ type: 'LoadValves' } as any, (state) => ({
    ...state,
    loading: true,
  }))
);
