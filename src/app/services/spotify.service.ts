import { Injectable, Inject, Optional, ApplicationRef } from '@angular/core';
import { Http, Response, Headers, Request, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SpotifyUser } from '../models/spotifyUser';
import { SpotifyTrack } from '../models/spotifytrack';
import { SpotifyPlaylistTrack } from '../models/spotifyplaylisttrack';
import { SpotifyTracklist } from '../models/spotifytracklist';
import { SpotifyPlaylist } from '../models/spotifyplaylist';
import { SpotifyPlaylistInfo } from '../models/spotifyplaylistinfo';
import { SpotifyPlayStatus } from '../models/spotifyPlayStatus';
import { SpotifyAlbum } from '../models/spotifyalbum';
import { SpotifyArtist } from '../models/spotifyartist';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SimpleTimer } from 'ng2-simple-timer';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface SpotifyConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
  authToken?: string;
  apiBase: string;
  clientSecret: string;
  accountApiBase: string;
  redirectPopupUri: string;
}

export interface SpotifyOptions {
  limit?: number;
  offset?: number;
  market?: string;
  album_type?: string;
  country?: string;
  type?: string;
  q?: string;
  timestamp?: string;
  locale?: string;
  public?: boolean;
  name?: string;
  position_ms?: number;
  volume_percent?: number;
  code?: string;
  redirect_uri?: string;
  grant_type?: string;
  refresh_token?: string;
  device_id?: string;
}

export interface HttpRequestOptions {
  method?: string;
  url: string;
  search?: Object;
  body?: Object;
  headers?: Headers;
}

@Injectable()
export class SpotifyService {
    trackEnd = false;
    playStatusTimerId: string;
    refreshTokenTimerId: string;
    tokenFallBackTimerId: string;
    deviceId: string;
    tokenRefreshedLastTime: Date = new Date();
    tokenRefreshed = false;
    currentTrackUri: string;
    lastCurrentTrackUri: string;
    lastProgress: number;
    currentUser: SpotifyUser;
    playStatus: SpotifyPlayStatus = new SpotifyPlayStatus();
    tempPlaylist: SpotifyPlaylistTrack[] = [];
    authenticationComplited = '';
    ignore = false;
    public authCompleted = false;
    private subjectPlayStatus = new BehaviorSubject<SpotifyPlayStatus>(new SpotifyPlayStatus());
    private subjectTrackEnded = new BehaviorSubject<boolean>(false);
    private subjectAuthenticationComplited = new BehaviorSubject<string>(null);
    private spotifyUrl = `${environment.backendUrl}/api/spotifyaccount`;  // URL to web api

    constructor(@Inject('SpotifyConfig') private config: SpotifyConfig,
        private http: Http,
        private st: SimpleTimer,
        private authService: AuthService,
        private applicationRef: ApplicationRef) {

    config.apiBase = 'https://api.spotify.com/v1';
    config.accountApiBase = 'https://accounts.spotify.com';

    this.st.newTimer('tokenFallback', 2);
    this.tokenFallBackTimerId = this.st.subscribe('tokenFallback', e => this.tokenfallback());
    }
    callback() {
        this.checkPlayerState().then(playState => {
            if (playState.progress_ms === 0 &&
                this.playStatus.is_playing &&
                !playState.is_playing &&
                this.lastCurrentTrackUri === this.currentTrackUri ) {
                this.st.delTimer('spotify');
                this.setTrackEnd(true);
                // kappale loppui. onko tämä tilanne aukoton?
            }
            this.setPlayStatus(playState);
            this.lastCurrentTrackUri = this.currentTrackUri;
        });
    }
    tokenfallback() {
        const currentTime = new Date();
        if ((currentTime > this.tokenRefreshedLastTime) && this.tokenRefreshed) {
            console.log('New token please');
            this.tokenRefreshed = false;
            if (!this.isMobile()) {
                this.loginPopup(false);
            }
        }
    }
    setAuthenticationComplited(status: string) {
        this.authenticationComplited = status;
        this.subjectAuthenticationComplited.next(status);
    }
    getAuthenticationComplited(): Observable<string> {
        return this.subjectAuthenticationComplited.asObservable();
    }

    setPlayStatus(playStatus: SpotifyPlayStatus) {
        this.playStatus = playStatus;
        this.subjectPlayStatus.next(playStatus);
    }
    getPlayStatus(): Observable<SpotifyPlayStatus> {
        return this.subjectPlayStatus.asObservable();
    }
    setTrackEnd(trackEnd: boolean) {
        this.trackEnd = trackEnd;
        this.subjectTrackEnded.next(this.trackEnd);
    }
    getTrackEnd(): Observable<boolean> {
        return this.subjectTrackEnded.asObservable();
    }
    startTimer() {
        this.st.delTimer('spotify');
        this.st.newTimer('spotify', 1);
        this.playStatusTimerId = this.st.subscribe('spotify', e => this.callback());
    }
    startRefreshTokenTimer(expires_in: number) {
        console.log('settimer');
        // this.st.delTimer('spotify_refresh_token');
        this.st.newTimer('spotify_refresh_token', expires_in - 60);
        this.setTokenRefreshedLastTime(expires_in);
        // this.st.newTimer('spotify_refresh_token', 30);
        this.ignore = true;
        this.refreshTokenTimerId = this.st.subscribe('spotify_refresh_token', e => this.getTokensByRefreshToken());
    }
    // if Spotify result is something like no rights i.e. then login. Don't login at start if you already have working token.
    play(trackUri?: string, options?: SpotifyOptions) {
        options = options || {};
        this.currentTrackUri = trackUri;
        this.playStatus.is_playing = true;
        this.setPlayStatus(this.playStatus);
        if (this.deviceId) {
            options.device_id = this.deviceId;
        }
        // Only one of either context_uri or uris can be specified. If neither are present, calling /play will resume playback.
        if (trackUri) {
            return this.api({
                method: 'put',
                url: `/me/player/play`,
                search: options,
                headers: this.getHeaders(true),
                body: {
                    uris :
                    ['spotify:track:' + this.getIdFromUri(trackUri)]}
            }).toPromise()
            .then(res => res.json())
            .catch(err => this.handlePromiseError(err));
        } else {
            return this.api({
                method: 'put',
                url: `/me/player/play`,
                search: options,
                headers: this.getHeaders(true)
            }).toPromise()
            .then(res => res.json())
            .catch(err => this.handlePromiseError(err));
        }
    }
    pause(options?: SpotifyOptions) {
        options = options || {};
        if ( this.playStatus.is_playing ) {
            this.playStatus.is_playing = false;
            this.setPlayStatus(this.playStatus);
            this.st.delTimer('spotify');
            return this.api({
                method: 'put',
                url: `/me/player/pause`,
                search: options,
                headers: this.getHeaders(true)
            }).toPromise()
            .then(res => res.json())
            .catch(err => this.handlePromiseError(err));
        } else {
            return new Promise<Response>((resolve, reject) => {
                resolve();
                // the resolve / reject functions control the fate of the promise
            });
        }
    }

    seek(options?: SpotifyOptions) {
        options = options || {};
        return this.api({
            method: 'put',
            url: `/me/player/seek`,
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => res.json())
        .catch(err => this.handlePromiseError(err));
    }
    setVolume(options?: SpotifyOptions) {
        options = options || {};
        if (this.deviceId) {
            options.device_id = this.deviceId;
        }
        return this.api({
            method: 'put',
            url: `/me/player/volume`,
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => res.json())
        .catch(err => this.handlePromiseError(err));
    }
    checkPlayerState(options?: SpotifyOptions) {
        options = options || {};

        return this.api({
            method: 'get',
            url: `/me/player/currently-playing`,
            search: options,
            headers: this.getHeaders(true)
        }).toPromise()
        .then(res => res.json() as SpotifyPlayStatus)
        .catch(err => this.handlePromiseError(err));
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
        search: options,
        headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => res.json().tracks.items as SpotifyTrack[])
        .catch(err => this.handlePromiseError(err));
    }

    //#endregion
    getUsersPlaylist( options?: SpotifyOptions) {
        options = options || {};

        return this.api({
        method: 'get',
        url: `/me/playlists`,
        search: options,
        headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => res.json().items as SpotifyPlaylist[])
        .catch(err => this.handlePromiseError(err));
    }
    getUser(): SpotifyUser {
        if (this.currentUser) {
            return this.currentUser;
        } else {
            return new SpotifyUser();
        }
    }
    getPlaylistTracks(playlistId: string, ownerId: string, options?: SpotifyOptions) {
        this.tempPlaylist = [];
        options = options || {};
        return this.api({
            method: 'get',
            url: '/users/' + ownerId + '/playlists/' + playlistId + '/tracks',
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => {
            return res.json() as SpotifyTracklist;
        })
        .catch(err => this.handlePromiseError(err));

    }
    getArtist(artistId: string, options?: SpotifyOptions) {
        this.tempPlaylist = [];
        options = options || {};

        return this.api({
            method: 'get',
            url: '/artists/' + artistId,
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => {
            return res.json() as SpotifyArtist;
        })
        .catch(err => this.handlePromiseError(err));

    }
    getArtistsAlbum(artistId: string, options?: SpotifyOptions) {
        this.tempPlaylist = [];
        options = options || {};
        options.album_type = 'album';
        options.limit = 50;
        return this.api({
            method: 'get',
            url: '/artists/' + artistId + '/albums',
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => {
            return res.json().items as SpotifyAlbum[];
        })
        .catch(err => this.handlePromiseError(err));

    }
    getArtistsTopTracks(artistId: string, options?: SpotifyOptions) {
        this.tempPlaylist = [];
        options = options || {};
        return this.api({
            method: 'get',
            url: '/artists/' + artistId + '/top-tracks',
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => {
            return res.json().tracks as SpotifyTrack[];
        })
        .catch(err => this.handlePromiseError(err));

    }
    getAlbumTracks(albumId: string, options?: SpotifyOptions) {
        this.tempPlaylist = [];
        options = options || {};

        return this.api({
            method: 'get',
            url: '/albums/' + albumId + '/tracks',
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => {
            return res.json().items as SpotifyTrack[];
        })
        .catch(err => this.handlePromiseError(err));

    }
    getAlbum(albumId: string, options?: SpotifyOptions) {
        this.tempPlaylist = [];
        options = options || {};

        return this.api({
            method: 'get',
            url: '/albums/' + albumId,
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => {
            return res.json() as SpotifyAlbum;
        })
        .catch(err => this.handlePromiseError(err));

    }
    getPlaylistInfo(playlistId: string, ownerId: string, options?: SpotifyOptions) {
        this.tempPlaylist = [];
        options = options || {};
        options.limit = 1;
        return this.api({
            method: 'get',
            url: '/users/' + ownerId + '/playlists/' + playlistId,
            search: options,
            headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => {
            return res.json() as SpotifyPlaylistInfo;
        })
        .catch(err => this.handlePromiseError(err));

    }

    getCurrentUser( options?: SpotifyOptions) {
        options = options || {};

        return this.api({
        method: 'get',
        url: `/me`,
        search: options,
        headers: this.getHeaders(true)
        })
        .toPromise()
        .then(res => {
            const user = res.json() as SpotifyUser;
            this.currentUser = user;
            return user;
        })
        .catch(err => this.handlePromiseError(err));
    }

    getTokens(code?: string) {
        const headers = this.authService.initAuthHeaders();
        const address = `${this.spotifyUrl}/code/${code}/${btoa(this.config.redirectUri)}`;

        return this.http
            .get(address, {headers: headers})
            .toPromise()
            .then((res: Response) => {
                const body = res.json();
                this.config.authToken = body.access_token;
                localStorage.setItem('spotify-access-token', body.access_token);
                localStorage.setItem('spotify-refresh-token', body.refresh_token);
                const expiresIn = +body.expires_in;
                this.startRefreshTokenTimer(expiresIn);
                return true;
            })
            .catch(err => {
                this.handlePromiseError(err);
                return false;
            } );

    }
    setTokenRefreshedLastTime(expiresIn: number) {
        const current = new Date();
        let time = current.getTime();
        time += (expiresIn * 1000);
        this.tokenRefreshedLastTime = new Date(time);
        this.tokenRefreshed = true;
    }
    getTokensByRefreshToken() {
        if (!this.ignore) {

            this.st.delTimer('spotify_refresh_token');
            const headers = this.authService.initAuthHeaders();
            const address = `${this.spotifyUrl}/refreshtoken/${
                localStorage.getItem('spotify-refresh-token')}/${btoa(this.config.redirectUri)}`;
            console.log('getTokensByRefreshToken');
            return this.http
                .get(address, {headers: headers})
                .toPromise()
                .then((res: Response) => {
                    const body = res.json();
                    this.config.authToken = body.access_token;
                    localStorage.setItem('spotify-access-token', body.access_token);
                    if (body.refresh_token) {
                        localStorage.setItem('spotify-refresh-token', body.refresh_token);
                    }

                    const expiresIn = +body.expires_in;
                    this.startRefreshTokenTimer(expiresIn);
                    this.authCompleted = true;
                    if (!this.authenticationComplited) {
                        this.setAuthenticationComplited('success');
                    }
                    return true;
                })
                .catch(err => {
                    // localStorage.removeItem('spotify-refresh-token');
                    this.authCompleted = false;
                    this.setAuthenticationComplited(null);
                    this.handlePromiseError(err);
                    return false;
                } );

        } else {
            this.ignore = false;
        }
    }

    login() {
        const state = this.generateRandomString(16);

        localStorage.setItem('spotify_auth_state', state);
        //localStorage.removeItem('spotify-access-token');
        localStorage.removeItem('spotify-refresh-token');
        const params = {
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scope.join(' ') || '',
            response_type: 'code',
            show_dialog: false,
            state: state
        };
        window.location.href = 'https://accounts.spotify.com/authorize?' + this.toQueryString(params);
    }

    //#region login

    loginPopup(relogin: boolean): Promise<Object> {
        return (new Promise((resolve, reject) => {
        const w = 400,
            h = 500,
            left = (screen.width / 2) - (w / 2),
            top = (screen.height / 2) - (h / 2);
        const state = this.generateRandomString(16);

        localStorage.setItem('spotify_auth_state', state);
        //localStorage.removeItem('spotify-access-token');
        localStorage.removeItem('spotify-refresh-token');
        const params = {
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectPopupUri,
            scope: this.config.scope.join(' ') || '',
            response_type: 'code',
            show_dialog: relogin,
            state: state
        };
        this.authCompleted = false;
        const authWindow = this.openDialog(
            'https://accounts.spotify.com/authorize?' + this.toQueryString(params),
            'Spotify',
            'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left,
            () => {
            if (!this.authCompleted) {
                return reject('Login rejected error');
            } else {
                return resolve();
            }
            }
        );
    
        const storageChanged = (e: any) => {

            if (e.key === 'spotify-code') {
                if (authWindow) {
                    authWindow.close();
                }
                const code = localStorage.getItem('spotify-code');
                this.getTokens(code)
                .then(ret => {
                    this.authCompleted = true;
                    this.setAuthenticationComplited('success');
                    return resolve('success');

                })
                .catch(err => {
                    this.authCompleted = false;
                    this.setAuthenticationComplited(null);
                    return reject('Login rejected error');
                });
                window.removeEventListener('storage', storageChanged, false);

            }
        };
        window.addEventListener('storage', storageChanged, false);
        
        })).then(() => null)
                .catch(this.handleError);
        
    }
    generateRandomString(length: number) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    //#endregion

    //#region utils

    private toQueryString(obj: Object): string {
        const parts: string[] = [];
        for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent((<any>obj)[key]));
        }
        }
        return parts.join('&');
    }
    public startGetToken(code: string): Promise<Object> {
        return (new Promise((resolve, reject) => {
        this.getTokens(code)
            .then(ret => {
                this.authCompleted = true;
                this.setAuthenticationComplited('success');
                return resolve('success');
            })
            .catch(err => {
                this.authCompleted = false;
                this.setAuthenticationComplited(null);
                return resolve('failed');
            });
        }));
    }

    private openDialog(uri: string, name: string, options: string, cb: any) {
        const win = window.open(uri, name, options);
        this.applicationRef.isStable.subscribe((s) => {
            if (s) {
                const interval = window.setInterval(() => {
                    try {
                        if (!win || win.closed) {
                        window.clearInterval(interval);
                        cb(win);
                        }
                    } catch (e) { }
                    }, 1000000);
            }
          });
        return win;
    }

    private auth(isJson?: boolean): Object {
        const auth = {
        'Authorization': 'Bearer ' + localStorage.getItem('spotify-access-token')
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
        const itemList = Array.isArray(items) ? items : items.split(',');
        itemList.forEach((value, index) => {
        itemList[index] = this.getIdFromUri(value);
        });
        return itemList;
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
    private handlePromiseError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        if (error.statusText === 'Unauthorized') {
            console.error('Unauthorized', error);
            /*if(localStorage.getItem('spotify-refresh-token') !== null)
            {
                this.getTokensByRefreshToken();
            }
            else
            {*/
                /*this.login(false).then(result => {
                });*/
            // }
        }
        return Promise.reject(error.message || error);
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
    isMobile() { 
        if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        ){
           return true;
         }
        else {
           return false;
         }
       }
}
