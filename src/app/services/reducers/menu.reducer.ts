import { createReducer, on } from '@ngrx/store';
import { State } from './reducer.state';
import { MenuNode } from '../../models/menu.model';
import { createActionGroup } from '@ngrx/store';
import { props } from '@ngrx/store';
export type MenuState = State & {
  menus: MenuNode[];
};
export const initialState: MenuState = {
  menus: [],
  loading: false,
  error: null,
};
export const MenuActions = createActionGroup({
  source: 'Menu',
  events: {
    AddMenu: props<{ menu: MenuNode }>(),
    DeleteMenu: props<{ id: string }>(),
  },
});
export const menuReducer = createReducer(
  initialState,
  on({ type: 'MenusLoadedSuccess' } as any, (state, action) => ({
    ...state,
    menus: action.payload,
    loading: false,
  })),
  on({ type: 'MenusLoadedError' } as any, (state, action) => ({
    ...state,
    menus: [],
    error: action.payload,
    loading: false,
  })),
  on({ type: 'LoadMenus' } as any, (state) => ({
    ...state,
    loading: true,
  })),
  on(MenuActions.addMenu, (state, { menu }) => {
    return { ...state, menus: [...state.menus, menu] };
  }),
  on({ type: 'DeleteMenu' } as any, (state, action) => {
    return {
      ...state,
      menus: state.menus.filter((menu) => menu.id !== action.id),
      loading: false,
    };
  })
);
