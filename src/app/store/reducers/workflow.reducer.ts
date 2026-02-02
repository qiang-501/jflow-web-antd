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
  id: 0,
  dWorkflowId: '',
  name: '',
  description: '',
  status: WorkflowStatus.DRAFT,
  priority: WorkflowPriority.MEDIUM,
  createdAt: '',
  updatedAt: '',
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
    currentWorkFlow: state.workFlows.find((w) => w.id === Number(id)) || null,
  })),
  on(WorkFlowActions.clearCurrentWorkFlow, (state) => ({
    ...state,
    currentWorkFlow: null,
  })),
);
