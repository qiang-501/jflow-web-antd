import { createActionGroup, props } from '@ngrx/store';
import { MenuNode } from '../../models/menu.model';

export const MenuActions = createActionGroup({
  source: 'Menu',
  events: {
    'Load Menus': props<{ page?: number }>(),
    'Menus Loaded Success': props<{ payload: MenuNode[] }>(),
    'Menus Loaded Error': props<{ payload: any }>(),
    'Add Menu': props<{ menu: MenuNode }>(),
    'Delete Menu': props<{ id: string }>(),
  },
});
