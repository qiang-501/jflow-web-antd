import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WorkFlow } from '../models/work-flow';

export const selectWorkFlow =
  createFeatureSelector<ReadonlyArray<WorkFlow>>('workflow');
export const selectWorkFlows =
  createFeatureSelector<ReadonlyArray<WorkFlow>>('workflows');

export const selectCollectionState =
  createFeatureSelector<ReadonlyArray<string>>('collection');

export const selectWorkFlowsCollection = createSelector(
  selectWorkFlows,
  selectCollectionState,
  (WorkFlows, collection) => {
    return collection.map(
      (id) => WorkFlows.find((WorkFlows) => WorkFlows.id === id)!
    );
  }
);
