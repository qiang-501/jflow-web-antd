import { createAction, createActionGroup, props } from '@ngrx/store';
import { WorkFlow } from '../../models/work-flow';

export const WorkFlowActions = createActionGroup({
  source: 'WorkFlow',
  events: {
    'Update WorkFlow': props<{
      status: string;
      important: string;
      due_date: string;
    }>(),
    'Add WorkFlow': props<{
      status: string;
      important: string;
      due_date: string;
    }>(),
    'Add WorkFlows': props<{ workflow: WorkFlow }>(),
    'Set Current WorkFlow': props<{ id: string }>(),
    'Clear Current WorkFlow': props<{ reset?: boolean }>(),
  },
});
