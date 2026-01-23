import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';

@Injectable()
export class TranslationService implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    console.log('get language: ' + lang);
    return this.http.get(`./assets/i18n/${lang.toLowerCase()}.json`);
  }
}
