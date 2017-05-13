import { Injectable, Inject, Optional } from '@angular/core';
import { Http, Response, Headers, Request } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SpotifyTrack } from '../models/spotifytrack';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface SpotifyConfig {
  clientId: string,
  redirectUri: string,
  scope: string[],
  authToken?: string,
  apiBase: string,
}

export interface SpotifyOptions {
  limit?: number,
  offset?: number,
  market?: string,
  album_type?: string,
  country?: string,
  type?: string,
  q?: string,
  timestamp?: string,
  locale?: string,
  public?: boolean,
  name?: string,
}

interface HttpRequestOptions {
  method?: string,
  url: string,
  search?: Object,
  body?: Object,
  headers?: Headers,
}

@Injectable()
export class SpotifyService {
    constructor(@Inject("SpotifyConfig") private config: SpotifyConfig, private http: Http) {
        config.apiBase = 'https://api.spotify.com/v1';
    }
    //if Spotify result is something like now rights i.e. then login. Don't login at start if you already have working token.
    play(trackUri: string, options?: SpotifyOptions) {
        options = options || {};

        return this.api({
        method: 'put',
        url: `/me/player/play`,
        search: options,
        headers: this.getHeaders(true),
        body: {
            uris :
            ["spotify:track:"+ this.getIdFromUri(trackUri)]}
        
        }).map(res => res.json());
        
    }
    pause(options?: SpotifyOptions) {
        options = options || {};

        return this.api({
            method: 'put',
            url: `/me/player/pause`,
            search: options,
            headers: this.getHeaders(true)
            }).map(res => res.json());
    }

    //#region search

  /**
    * Search Spotify
    * q = search query
    * type = artist, album or track
    */
    search(q: string, type: string, options?: SpotifyOptions) {
        options = options || {};
        options.q = q;
        options.type = type;

        return this.api({
        method: 'get',
        url: `/search`,
        search: options
        }).map(res => res.json().tracks.items as SpotifyTrack[]);
    }

    //#endregion
    
    //#region login

    login() : Promise<Object> {
        return (new Promise((resolve, reject) => {
        var w = 400,
            h = 500,
            left = (screen.width / 2) - (w / 2),
            top = (screen.height / 2) - (h / 2);

        var params = {
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scope.join(' ') || '',
            response_type: 'token'
        };
        var authCompleted = false;
        console.log(this.toQueryString(params));
        var authWindow = this.openDialog(
            'https://accounts.spotify.com/authorize?' + this.toQueryString(params),
            'Spotify',
            'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left,
            () => {
            if (!authCompleted) {
                return reject('Login rejected error');
            }
            }
        );

        var storageChanged = (e: any) => {
            if (e.key === 'spotify-token') 
            {
                if (authWindow) {
                    authWindow.close();
                }
                authCompleted = true;

                this.config.authToken = e.newValue;
                window.removeEventListener('storage', storageChanged, false);

                return resolve(e.newValue);
            }
        };
        window.addEventListener('storage', storageChanged, false);
        })).then(() => null)
                .catch(this.handleError);;
    }

    //#endregion

    //#region utils

    private toQueryString(obj: Object): string {
        var parts : string[] = [];
        for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent((<any>obj)[key]));
        }
        };
        return parts.join('&');
    };

    private openDialog(uri: string, name: string, options: string, cb: any) {
        var win = window.open(uri, name, options);
        var interval = window.setInterval(() => {
        try {
            if (!win || win.closed) {
            window.clearInterval(interval);
            cb(win);
            }
        } catch (e) { }
        }, 1000000);
        return win;
    }

    private auth(isJson?: boolean): Object {
        var auth = {
        'Authorization': 'Bearer ' + localStorage.getItem('spotify-token')//this.config.authToken
        };
        if (isJson) {
        (<any>auth)['Content-Type'] = 'application/json';
        }
        return auth;
    }

    private getHeaders(isJson?: boolean): any {
        return new Headers(this.auth(isJson));
    }

    private getIdFromUri(uri: string): string {
        return uri.indexOf('spotify:') === -1 ? uri : uri.split(':')[2];
    }

    private mountItemList(items: string | Array<string>): Array<string> {
        var itemList = Array.isArray(items) ? items : items.split(',');
        itemList.forEach((value, index) => {
        itemList[index] = this.getIdFromUri(value);
        });
        return itemList;
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

    private api(requestOptions: HttpRequestOptions) {
        return this.http.request(new Request({
        url: this.config.apiBase + requestOptions.url,
        method: requestOptions.method || 'get',
        search: this.toQueryString(requestOptions.search),
        body: JSON.stringify(requestOptions.body),
        headers: requestOptions.headers
        }));
    }

    //#endregion

}