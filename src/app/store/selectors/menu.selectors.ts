import { createSelector, createFeatureSelector } from '@ngrx/store';
import { MenuState } from '../reducers';

export const selectMenuState = createFeatureSelector<MenuState>('menus');

export const selectAllMenus = createSelector(
  selectMenuState,
  (state) => state.menus,
);

export const selectMenusLoading = createSelector(
  selectMenuState,
  (state) => state.loading,
);

export const selectMenusError = createSelector(
  selectMenuState,
  (state) => state.error,
);

export const selectMenuById = (id: string) =>
  createSelector(selectAllMenus, (menus) =>
    menus.find((menu) => menu.id === id),
  );
