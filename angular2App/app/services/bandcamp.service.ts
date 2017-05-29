import { Injectable } from '@angular/core';
import { Http, Response, Request } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpRequestOptions} from './spotify.service';
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
    baseUri : string = "http://bandcamp.com/";
    constructor(private http: Http) { }
    doBandcampCall(options: BandcampOptions) {

        return this.api({
            method: 'get',
            url: `search`,
            search: options
        })
        .toPromise()
        .then(res => 
        {

            var searchResults = htmlParser.parseSearchResults(res);
            return res;
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
    firstAttempt(q: Object)
    {
        return new Promise( (resolve, reject) => {
            bandcamp.search(q, (err:any, result:any) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
}