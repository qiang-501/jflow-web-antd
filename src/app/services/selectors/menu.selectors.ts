import { createSelector, createFeatureSelector } from '@ngrx/store';
import { MenuNode } from '../../models/menu.model';
export const selectMenus =
  createFeatureSelector<ReadonlyArray<MenuNode>>('menus');
