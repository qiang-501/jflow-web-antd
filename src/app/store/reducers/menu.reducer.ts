import { createReducer, on } from '@ngrx/store';
import { MenuNode } from '../../models/menu.model';
import { MenuActions } from '../actions';

export interface MenuState {
  menus: MenuNode[];
  loading: boolean;
  error: any;
}

export const initialState: MenuState = {
  menus: [],
  loading: false,
  error: null,
};

export const menuReducer = createReducer(
  initialState,
  on(MenuActions.loadMenus, (state) => ({
    ...state,
    loading: true,
  })),
  on(MenuActions.menusLoadedSuccess, (state, { payload }) => ({
    ...state,
    menus: payload,
    loading: false,
    error: null,
  })),
  on(MenuActions.menusLoadedError, (state, { payload }) => ({
    ...state,
    menus: [],
    error: payload,
    loading: false,
  })),
  on(MenuActions.addMenu, (state, { menu }) => ({
    ...state,
    menus: [...state.menus, menu],
  })),
  on(MenuActions.deleteMenu, (state, { id }) => ({
    ...state,
    menus: state.menus.filter((menu) => menu.id !== id),
  })),
);
