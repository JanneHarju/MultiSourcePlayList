import { Injectable } from '@angular/core';
import { Http, Response, Request } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpRequestOptions} from './spotify.service';
import { SearchResult } from '../json_schema/SearchResult';
import { AlbumInfo } from '../json_schema/BandCampAlbumInfo';
import { AuthService } from './auth.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
var bandcamp = require('../../../node_modules/bandcamp-scraper/lib/index'),
    htmlParser  = require('../../../node_modules/bandcamp-scraper/lib/htmlParser.js'),
    utils       = require('../../../node_modules/bandcamp-scraper/lib/utils.js');
export interface BandcampOptions {
  page: number,
  q: string
}
@Injectable()
export class BandcampService {
    baseUri : string = "api/bandcamp";
    constructor(
        private authService: AuthService,
        private http: Http) { }

    bandCampSearch(options: BandcampOptions) {

        return this.api({
            method: 'get',
            url: ``,
            search: options,
            headers: this.authService.initAuthHeaders()
        })
        .toPromise()
        .then(res => 
        {
            return htmlParser.parseSearchResults(res.text()) as SearchResult[];
        })
        .catch(this.handlePromiseError);
    }
    bandCampAlbumInfo(url: string) {
        let decodedUrl = atob(url);
        const fullUrl = `/albuminfo/${url}`;
        return this.api({
            method: 'get',
            url: fullUrl,
            headers: this.authService.initAuthHeaders()
        })
        .toPromise()
        .then(res => 
        {
            return htmlParser.parseAlbumInfo(res.text(), decodedUrl) as AlbumInfo;
        })
        .catch(this.handlePromiseError);
    }

    bandCampAlbumUrls(url: string) {
        let decodedUrl = atob(url);
        const fullUrl = `/albumurls/${url}`;
        return this.api({
            method: 'get',
            url: fullUrl,
            headers: this.authService.initAuthHeaders()
        })
        .toPromise()
        .then(res => 
        {
            return htmlParser.parseAlbumUrls(res.text(), decodedUrl) as string[];
        })
        .catch(this.handlePromiseError);
    }

    private toQueryString(obj: Object): string {
        var parts : string[] = [];
        for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent((<any>obj)[key]));
        }
        };
        return parts.join('&');
    };
    private api(requestOptions: HttpRequestOptions) {
        return this.http.request(new Request({
        url: this.baseUri + requestOptions.url,
        method: requestOptions.method || 'get',
        search: this.toQueryString(requestOptions.search),
        body: JSON.stringify(requestOptions.body),
        headers: requestOptions.headers
        }));
    }
    private handlePromiseError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}