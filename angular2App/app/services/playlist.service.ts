import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Playlist } from '../models/playlist'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class PlaylistService {
    private PlaylistsUrl = 'api/playlists';  // URL to web api

    private headers = new Headers({'Content-Type': 'application/json'});
    
    constructor(private http: Http) { }
    getPlaylists(): Promise<Playlist[]> {
        return this.http.get(this.PlaylistsUrl)
                .toPromise()
                .then((response: Response) => response.json() as Playlist[])
                .catch(this.handleError);
    }
    getPlaylist(id: number): Promise<Playlist> {
        const url = `${this.PlaylistsUrl}/${id}`;
        return this.http.get(url)
            .toPromise()
            .then((response: Response) => response.json() as Playlist)
            .catch(this.handleError);
    }
    private handleError(error: any): Promise<any> {
        //console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    update(Playlist: Playlist): Promise<Playlist> {
        const url = `${this.PlaylistsUrl}/${Playlist.id}`;
        return this.http
            .put(url, Playlist, {headers: this.headers})
            .toPromise()
            .then(() => Playlist)
            .catch(this.handleError);
    }
    create(name: string): Promise<Playlist> {
        const tmpPlaylist = new Playlist();
        tmpPlaylist.name = name;
        //tmpHero.name = name;
        return this.http
            .post(this.PlaylistsUrl, tmpPlaylist, {headers: this.headers})
            .toPromise()
            .then((res: Response) => res.json())
            .catch(this.handleError);
    }
    delete(id: number): Promise<void> {
        const url = `${this.PlaylistsUrl}/${id}`;
        return this.http.delete(url, {headers: this.headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }
}