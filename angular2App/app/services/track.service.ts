import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { Track } from '../models/track';

@Injectable()
export class TrackService {
    private tracksUrl = 'api/tracks';  // URL to web api

    private headers = new Headers({'Content-Type': 'application/json'});
    constructor( private http: Http) { }

    getTracks(): Promise<Track[]> {
        return this.http.get(this.tracksUrl)
                .toPromise()
                .then(response => response.json() as Track[])
                .catch(this.handleError);
    }
    getPlaylistTracks(id: number): Promise<Track[]> {
        const playlist = "true";
        let params: URLSearchParams = new URLSearchParams();
        params.set('playlist', playlist);
        let requestOptions = new RequestOptions();
        requestOptions.search = params;
        const url = `${this.tracksUrl}/${id}/${playlist}`;
        return this.http.get(url)
                .toPromise()
                .then(response => response.json() as Track[])
                .catch(this.handleError);
    }
    getTrack(id: number): Promise<Track> {
        const url = `${this.tracksUrl}/${id}`;
        return this.http.get(url)
            .toPromise()
            .then(response => response.json() as Track)
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

    update(track: Track): Promise<Track> {
        const url = `${this.tracksUrl}/${track.id}`;
        return this.http
            .put(url, track, {headers: this.headers})
            .toPromise()
            .then(() => track)
            .catch(this.handleError);
    }
    create(name: string): Promise<Track> {
        const tmpTrack = new Track();
        //tmpHero.name = name;
        return this.http
            .post(this.tracksUrl, tmpTrack, {headers: this.headers})
            .toPromise()
            .then(res => res.json())
            .catch(this.handleError);
    }
    delete(id: number): Promise<void> {
        const url = `${this.tracksUrl}/${id}`;
        return this.http.delete(url, {headers: this.headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

}