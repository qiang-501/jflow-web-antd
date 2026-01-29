import { createReducer, on } from '@ngrx/store';
import {
  WorkFlow,
  WorkflowStatus,
  WorkflowPriority,
} from '../../models/work-flow';
import { WorkFlowActions } from '../actions';

export interface WorkFlowState {
  currentWorkFlow: WorkFlow | null;
  workFlows: WorkFlow[];
}

const initialWorkFlow: WorkFlow = {
  id: '',
  d_workflow_id: '',
  name: '',
  description: '',
  status: WorkflowStatus.DRAFT,
  important: '',
  process_id: '',
  due_date: '',
  created_by: '',
  created_on: '',
  priority: WorkflowPriority.MEDIUM,
};

export const initialState: WorkFlowState = {
  currentWorkFlow: null,
  workFlows: [],
};

export const workFlowReducer = createReducer(
  initialState,
  on(
    WorkFlowActions.updateWorkFlow,
    (state, { status, important, due_date }) => ({
      ...state,
      currentWorkFlow: state.currentWorkFlow
        ? {
            ...state.currentWorkFlow,
            status: status as WorkflowStatus,
            important,
            due_date,
          }
        : null,
    }),
  ),
  on(WorkFlowActions.addWorkFlows, (state, { workflow }) => ({
    ...state,
    workFlows: [...state.workFlows, workflow],
  })),
  on(WorkFlowActions.setCurrentWorkFlow, (state, { id }) => ({
    ...state,
    currentWorkFlow: state.workFlows.find((w) => w.id === id) || null,
  })),
  on(WorkFlowActions.clearCurrentWorkFlow, (state) => ({
    ...state,
    currentWorkFlow: null,
  })),
);
