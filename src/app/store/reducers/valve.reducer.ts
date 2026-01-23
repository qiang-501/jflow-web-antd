import { createReducer, on } from '@ngrx/store';
import { ValveActions } from '../actions';

export interface ValveState {
  valves: any; // 后端返回的完整响应对象（包含data和meta）
  loading: boolean;
  error: any;
}

export const initialState: ValveState = {
  valves: null,
  loading: false,
  error: null,
};

export const valveReducer = createReducer(
  initialState,
  on(ValveActions.loadValves, (state) => ({
    ...state,
    loading: true,
  })),
  on(ValveActions.valvesLoadedSuccess, (state, { payload }) => ({
    ...state,
    valves: payload,
    loading: false,
    error: null,
  })),
  on(ValveActions.valvesLoadedError, (state, { payload }) => ({
    ...state,
    valves: null,
    error: payload,
    loading: false,
  })),
);
