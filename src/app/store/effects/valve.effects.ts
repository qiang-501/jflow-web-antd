import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ValveActions } from '../actions';

@Injectable()
export class ValveEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadValves$ = createEffect(() => {
    const request = {
      search_parameters: [
        {
          search_type: 'valves',
          operators: [
            {
              field: 'tenant_id',
              type: 'and',
              value: ['a03e630b-1df0-4088-900a-7270e9c9fc11'],
              match_type: 'match_phrase',
            },
            {
              field: 'status_flag.keyword',
              type: 'and',
              value: 'ACTIVE',
              match_type: 'match_phrase',
              filter_type: 1,
            },
            {
              field: 'serial_number.keyword',
              type: 'and',
              value: '1',
              match_type: 'wildcard',
              filter_type: 1,
            },
          ],
          range_operations: [],
          sort: [
            {
              field: 'valve_ship_date',
              order: 'desc',
            },
          ],
        },
      ],
      size: 10,
      start: 0,
    };

    const tokenStr = localStorage.getItem('token') || '';
    const authCode = 'Bearer ' + tokenStr;

    return this.actions$.pipe(
      ofType(ValveActions.loadValves),
      mergeMap((action: any) => {
        request.start = action.payload?.startRow || 0;
        request.size = action.payload?.endRow
          ? action.payload.endRow - action.payload.startRow
          : 10;

        console.log('Valve effect - sending request:', {
          url: 'asset-fake-search/api/v1/valves/search',
          start: request.start,
          size: request.size,
        });

        return this.http
          .post('asset-fake-search/api/v1/valves/search', request, {
            headers: { Authorization: authCode },
          })
          .pipe(
            map((valves) => {
              console.log('Valve effect - received response:', valves);
              return ValveActions.valvesLoadedSuccess({ payload: valves });
            }),
            catchError((error) => {
              console.error('Valve effect - error:', error);
              return of(ValveActions.valvesLoadedError({ payload: error }));
            }),
          );
      }),
    );
  });
}
