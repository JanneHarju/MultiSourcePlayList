import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, URLSearchParams, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { Track } from '../models/track';
import { AuthService } from './auth.service';

@Injectable()
export class TrackService {
    private tracksUrl = 'api/tracks';  // URL to web api

    //private headers = new Headers({'Content-Type': 'application/json'});
    constructor( 
        private http: Http,
        private authService: AuthService) 
    { }

    getTracks(): Promise<Track[]> {

        let headers = this.authService.initAuthHeaders();
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.tracksUrl, options)
                .toPromise()
                .then((response: Response) => response.json() as Track[])
                .catch(this.handleError);
    }
    getPlaylistTracks(id: number): Promise<Track[]> {
        const playlist = "true";
        /*let params: URLSearchParams = new URLSearchParams();
        params.set('playlist', playlist);
        let requestOptions = new RequestOptions();
        requestOptions.search = params;*/

        let headers = this.authService.initAuthHeaders();
        let options = new RequestOptions({ headers: headers });
        const url = `${this.tracksUrl}/${id}/${playlist}`;
        return this.http.get(url, options)
                .toPromise()
                .then((response: Response) => response.json() as Track[])
                .catch(this.handleError);
    }
    getTrack(id: number): Promise<Track> {

        let headers = this.authService.initAuthHeaders();
        let options = new RequestOptions({ headers: headers });
        const url = `${this.tracksUrl}/${id}`;
        return this.http.get(url, options)
            .toPromise()
            .then((response: Response) => response.json() as Track)
            .catch(this.handleError);
    }
    private handleError(error: any): Promise<any> {
        //console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    /*getHero(id: number): Promise<Info> {
        const url = `${this.heroesUrl}/${id}`;
        return this.http.get(url)
            .toPromise()
            .then(response => response.json() as Info)
            .catch(this.handleError);
    }*/
    updatePlaylistOrder(tracks: Track[])
    {

        let headers = this.authService.initAuthHeaders();
        return this.http
            .put(this.tracksUrl, tracks, {headers: headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }
    update(track: Track): Promise<Track> {

        let headers = this.authService.initAuthHeaders();
        const url = `${this.tracksUrl}/${track.id}`;
        return this.http
            .put(url, track, {headers: headers})
            .toPromise()
            .then(() => track)
            .catch(this.handleError);
    }
    create(track: Track): Promise<void> {

        let headers = this.authService.initAuthHeaders();
        //tmpHero.name = name;
        return this.http
            .post(this.tracksUrl, track, {headers: headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }
    createMany(tracks: Track[]): Promise<void> {

        let headers = this.authService.initAuthHeaders();
        //tmpHero.name = name;
        return this.http
            .post(this.tracksUrl, tracks, {headers: headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }
    delete(id: number): Promise<void> {

        let headers = this.authService.initAuthHeaders();
        const url = `${this.tracksUrl}/${id}`;
        return this.http.delete(url, {headers: headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

}