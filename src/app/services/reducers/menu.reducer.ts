import { createReducer, on } from '@ngrx/store';
import { State } from './reducer.state';
import { MenuNode } from '../../models/menu.model';

export type MenuState = State & {
  menus: MenuNode[];
};

export const initialState: MenuState = {
  menus: [],
  loading: false,
  error: null,
};

export const menuReducer = createReducer(
  initialState,
  // 处理 MenusLoadedSuccess Action
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
  }))
);
