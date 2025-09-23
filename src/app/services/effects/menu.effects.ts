import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class MenuEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  loadMenus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType('LoadMenus'),
      mergeMap((action) => {
        return this.http.get('api/menu').pipe(
          map((menus) => ({
            type: 'MenusLoadedSuccess',
            payload: menus,
          })),
          catchError((e) => of({ type: 'MenusLoadedError', payload: e }))
        );
      })
    );
  });
  loadMenuActions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType('LoadMenuActions'),
      mergeMap((action) => {
        return this.http.get('api/menu/actions').pipe(
          map((menus) => ({
            type: 'MenuActionsLoadedSuccess',
            payload: menus,
          })),
          catchError((e) => of({ type: 'MenuActionsLoadedError', payload: e }))
        );
      })
    );
  });
}
