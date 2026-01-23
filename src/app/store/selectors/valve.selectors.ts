import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ValveState } from '../reducers';

export const selectValveState = createFeatureSelector<ValveState>('valves');

export const selectAllValves = createSelector(
  selectValveState,
  (state) => state.valves,
);

export const selectValvesLoading = createSelector(
  selectValveState,
  (state) => state.loading,
);

export const selectValvesError = createSelector(
  selectValveState,
  (state) => state.error,
);
