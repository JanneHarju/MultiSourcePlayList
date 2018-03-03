import { Injectable } from '@angular/core';
import { Http, Response, Request } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { MusixMatchLyric } from '../models/musixmatchlyric';
import { HttpRequestOptions} from './spotify.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface MusixMatchOptions {
    apikey?: string;
    q_track?: string,
    q_artist?: string,
    maxResults?: number,
    format?: string,
    callback?: string
}

@Injectable()
export class MusixMatchAPIService {
    baseUri = 'http://api.musixmatch.com/ws/1.1/';
    key = '4580db683fb8c0d7073ec8fc7ce2c474';
    constructor(private http: Http) { }
    search(q: string) {
        let artist = this.getArtistFromQuery(q);
        let track = this.getTrackFromQuery(q);
        let options: MusixMatchOptions;
        options = {};
        options.format = 'jsonp';
        options.callback = 'callback';
        options.apikey = this.key;
        options.q_artist = artist;
        options.q_track = track;
        return this.api({
        method: 'get',
        url: `matcher.lyrics.get`,
        search: options
    }).map(res => {
        let body = res.text();
        let callback = 'callback(';
        let callbackEnd = ');';
        let part1 = body.split(callback)[1];
        let part2 =  part1.split(callbackEnd)[0];
        //return part2;
        return JSON.parse(part2).message.body.lyrics as MusixMatchLyric;
    }); //.message.body.lyrics as MusixMatchLyric);
    }

    private toQueryString(obj: Object): string {
        let parts: string[] = [];
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
        body: JSON.stringify(requestOptions.body)//,
        //headers: requestOptions.headers
        }));
    }
    getArtistFromQuery(q: string) : string {
        let parts = q.split(' - ');
        let artist = '';
        if (parts != null && parts.length > 0) {
            artist = parts[0];
        }
        return artist;
    }
    getTrackFromQuery(q: string) : string {
        let parts = q.split(' - ');
        let track = '';
        if (parts != null && parts.length > 1) {
            track = parts[1];
        }
        return track;
    }
}