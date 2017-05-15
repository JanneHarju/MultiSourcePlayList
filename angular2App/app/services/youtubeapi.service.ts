import { Injectable } from '@angular/core';
import { Http, Response, Request } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { YoutubeVideo } from '../models/youtubeVideo';
import { HttpRequestOptions} from './spotify.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface YoutubeOptions {
  part?: string,
  type?: string,
  q?: string,
  key?: string,
  maxResults?: number
}

@Injectable()
export class YoutubeAPIService {
    baseUri: string = "https://www.googleapis.com/youtube/v3";
    key: string = "AIzaSyCBJf1-O0F4J37lTx7Avlfk5hTWYBydWQE";
    constructor(private http: Http) { }
    search(q: string) {
        let options: YoutubeOptions;
        options = {};
        options.q = q;
        options.type = "video";
        options.key = this.key;
        options.part = "snippet";
        options.maxResults = 20;
        return this.api({
        method: 'get',
        url: `/search`,
        search: options
        }).map(res => res.json().items as YoutubeVideo[]);
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

    /*private getHeaders(isJson?: boolean): any {
        return new Headers(this.auth(isJson));
    }*/

    /*private getIdFromUri(uri: string): string {
        return uri.indexOf('spotify:') === -1 ? uri : uri.split(':')[2];
    }*/

    /*private mountItemList(items: string | Array<string>): Array<string> {
        var itemList = Array.isArray(items) ? items : items.split(',');
        itemList.forEach((value, index) => {
        itemList[index] = this.getIdFromUri(value);
        });
        return itemList;
    }*/

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

    private api(requestOptions: HttpRequestOptions) {
        return this.http.request(new Request({
        url: this.baseUri + requestOptions.url,
        method: requestOptions.method || 'get',
        search: this.toQueryString(requestOptions.search),
        body: JSON.stringify(requestOptions.body),
        headers: requestOptions.headers
        }));
    }
}