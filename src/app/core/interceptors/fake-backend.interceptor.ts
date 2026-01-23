import {
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpHandlerFn,
  HttpEventType,
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import * as MENU from '../../../assets/data/menuResult.json';
import * as MENUACTION from '../../../assets/data/menuActions.json';

const menuList: any = (MENU as any).default;
const menuActionList: any = (MENUACTION as any).default;

export function FakeBackendInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const { url, method, body } = req;

  return of(null)
    .pipe(mergeMap(handleRoute))
    .pipe(materialize())
    .pipe(delay(500))
    .pipe(dematerialize());

  function handleRoute() {
    if (url.endsWith('api/menu') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: menuList })).pipe(
        delay(500),
      );
    }

    if (url.endsWith('api/menu/actions') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: menuActionList })).pipe(
        delay(500),
      );
    }

    return next(req).pipe(
      tap((event) => {
        if (event.type === HttpEventType.Response) {
          console.log(req.url, 'returned a response with status', event.status);
        }
      }),
    );
  }
}
