import { createActionGroup, props } from '@ngrx/store';

export const ValveActions = createActionGroup({
  source: 'Valve',
  events: {
    'Load Valves': props<{ payload?: { startRow: number; endRow: number } }>(),
    'Valves Loaded Success': props<{ payload: any }>(),
    'Valves Loaded Error': props<{ payload: any }>(),
  },
});
