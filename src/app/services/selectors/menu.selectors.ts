import { createSelector, createFeatureSelector } from '@ngrx/store';
import { MenuNode } from '../../models/menu.model';
import { MenuState } from '../reducers/menu.reducer';

export const selectMenus = createFeatureSelector<MenuState>('menus');
