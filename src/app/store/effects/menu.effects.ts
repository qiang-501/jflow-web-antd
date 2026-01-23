import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MenuActions } from '../actions';

@Injectable()
export class MenuEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadMenus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MenuActions.loadMenus),
      mergeMap(() => {
        return this.http.get('api/menu').pipe(
          map((menus: any) =>
            MenuActions.menusLoadedSuccess({ payload: menus }),
          ),
          catchError((error) =>
            of(MenuActions.menusLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });

  loadMenuActions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType('LoadMenuActions'),
      mergeMap(() => {
        return this.http.get('api/menu/actions').pipe(
          map((menus) => ({
            type: 'MenuActionsLoadedSuccess',
            payload: menus,
          })),
          catchError((e) => of({ type: 'MenuActionsLoadedError', payload: e })),
        );
      }),
    );
  });
}
