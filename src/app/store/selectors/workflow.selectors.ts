import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WorkFlowState } from '../reducers';

export const selectWorkFlowState =
  createFeatureSelector<WorkFlowState>('workflows');

export const selectCurrentWorkFlow = createSelector(
  selectWorkFlowState,
  (state) => state.currentWorkFlow,
);

export const selectAllWorkFlows = createSelector(
  selectWorkFlowState,
  (state) => state.workFlows,
);

export const selectWorkFlowById = (id: string) =>
  createSelector(selectAllWorkFlows, (workflows) =>
    workflows.find((workflow) => workflow.id === id),
  );
