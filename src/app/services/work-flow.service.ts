import { Injectable } from '@angular/core';
import { WorkFlow } from '../models/work-flow';
import { createReducer, on } from '@ngrx/store';
import { createAction, props, createActionGroup } from '@ngrx/store';
import { Valve } from './models/valves';
@Injectable({
  providedIn: 'root',
})
export class WorkFlowService {}

export const BooksActions = createActionGroup({
  source: 'Books',
  events: {
    'Add Book': props<{ id: string }>(),
    'Remove Book': props<{ id: string }>(),
  },
});
export const updateWorkFlowAction = createAction(
  '[WorkFlow] Update Work Flow',
  props<{ status: string; important: string; due_date: string }>()
);
export const addWorksFlowAction = createAction(
  '[WorkFlow] Add Work Flow',
  props<{ status: string; important: string; due_date: string }>()
);
export const addWorkFlowsAction = createAction(
  '[WorkFlow] Add Work Flows',
  props<{ workflow: WorkFlow }>()
);
let workFlow: WorkFlow = {
  id: '',
  d_workflow_id: '',
  status: '',
  important: '',
  process_id: '',
  due_date: '',
  created_by: '',
  created_on: '',
};
let workFlows: Array<WorkFlow> = [];

export const workFlowsReducer = createReducer(
  workFlows,
  on(addWorkFlowsAction, (state, { workflow }) => {
    return [...state, workflow];
  })
);

export const workFlowReducer = createReducer(
  workFlow,
  on(updateWorkFlowAction, (state, { status, important, due_date }) => {
    return {
      ...state,
      status,
      important,
      due_date,
    };
  }),
  on(BooksActions.removeBook, (state, { id }) => {
    state.id = id;
    return state;
  }),
  on(BooksActions.addBook, (state, { id }) => {
    state.id = id;
    return state;
  })
);
