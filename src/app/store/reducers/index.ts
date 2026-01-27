import { ActionReducerMap } from '@ngrx/store';
import { WorkFlowState, workFlowReducer } from './workflow.reducer';
import { ValveState, valveReducer } from './valve.reducer';
import { MenuState, menuReducer } from './menu.reducer';
import { UserState } from '../../models/user.model';
import { RoleState } from '../../models/role.model';
import { PermissionState } from '../../models/permission.model';
import { userReducer } from './user.reducer';
import { roleReducer } from './role.reducer';
import { permissionReducer } from './permission.reducer';

export interface AppState {
  workflows: WorkFlowState;
  valves: ValveState;
  menus: MenuState;
  user: UserState;
  role: RoleState;
  permission: PermissionState;
}

export const reducers: ActionReducerMap<AppState> = {
  workflows: workFlowReducer,
  valves: valveReducer,
  menus: menuReducer,
  user: userReducer,
  role: roleReducer,
  permission: permissionReducer,
};

export type {
  WorkFlowState,
  ValveState,
  MenuState,
  UserState,
  RoleState,
  PermissionState,
};
