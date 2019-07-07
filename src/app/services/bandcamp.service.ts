import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRequestOptions } from './spotify.service';
import { SearchResult } from '../json_schema/SearchResult';
import { AlbumInfo } from '../json_schema/BandCampAlbumInfo';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/*import * as bandcamp from '../../../node_modules/bandcamp-scraper/lib/index';
import * as htmlParser from '../../../node_modules/bandcamp-scraper/lib/htmlParser.js';
import * as utils from '../../../node_modules/bandcamp-scraper/lib/utils.js';*/
/*let bandcamp = require('../../../node_modules/bandcamp-scraper/lib/index'),
    htmlParser  = require('../../../node_modules/bandcamp-scraper/lib/htmlParser.js'),
    utils       = require('../../../node_modules/bandcamp-scraper/lib/utils.js');*/
// import * as htmlParser from '../../../node_modules/bandcamp-scraper/lib/htmlParser.js';

export interface BandcampOptions {
  page: number;
  q: string;
}
@Injectable()
export class BandcampService {
  baseUri = `${environment.backendUrl}/api/bandcamp`;
  constructor(private authService: AuthService, private http: HttpClient) {}

  bandCampSearch(options: BandcampOptions) {
    return this.http
      .get<any>(this.baseUri, {
        params: this.makeHttpParams(options),
        headers: this.authService.initAuthHeaders()
      })
      .toPromise()
      .then((res) => {
        return {} as SearchResult[];
      })
      .catch(this.handlePromiseError);
  }
  bandCampAlbumInfo(url: string) {
    const decodedUrl = atob(url);
    const fullUrl = `/albuminfo/${url}`;
    return this.http
      .get<any>(`${this.baseUri}${fullUrl}`, {
        headers: this.authService.initAuthHeaders()
      })
      .toPromise()
      .then((res) => {
        return {} as AlbumInfo;
      })
      .catch(this.handlePromiseError);
  }

  bandCampAlbumUrls(url: string) {
    const decodedUrl = atob(url);
    const fullUrl = `/albumurls/${url}`;
    return this.http
      .get<any>(`${this.baseUri}${fullUrl}`, {
        headers: this.authService.initAuthHeaders()
      })
      .toPromise()
      .then((res) => {
        return {} as string[];
      })
      .catch(this.handlePromiseError);
  }

  private toQueryString(obj: Object): string {
    const parts: string[] = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent((<any>obj)[key]));
      }
    }
    return parts.join('&');
  }
  private handlePromiseError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  private makeHttpParams(options: any): HttpParams {
    let params = new HttpParams();
    Object.keys(options).forEach((e) => (params = params.set(e, options[e])));
    return params;
  }
}
