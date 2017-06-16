import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { Playlist } from '../models/playlist'
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import { AuthService } from './auth.service';

@Injectable()
export class PlaylistService {
    private PlaylistsUrl = 'api/playlists';  // URL to web api

    private playlistsModified = new Subject<boolean>();
    //private headers = new Headers({'Content-Type': 'application/json'});
    
    constructor(
        private http: Http,
        private authService: AuthService,
        private router: Router) { }
    setPlaylistsModified(modified: boolean)
    {
        this.playlistsModified.next(modified);
    }
    getPlaylistsModified() : Observable<boolean>
    {
        return this.playlistsModified.asObservable();
    }
    getPlaylists(): Promise<Playlist[]> {

        let headers = this.authService.initAuthHeaders();
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.PlaylistsUrl, options)
                .toPromise()
                .then((response: Response) => response.json() as Playlist[])
                .catch(this.handleError);
    }
    getUsersPlaylists(): Promise<Playlist[]> {

        let headers = this.authService.initAuthHeaders();
        let options = new RequestOptions({ headers: headers });
        
        let url = this.PlaylistsUrl + "/GetUsersPlaylists";
        return this.http.get(url, options)
                .toPromise()
                .then((response: Response) => response.json() as Playlist[])
                .catch(this.handleError);
    }
    getPlaylist(id: number): Promise<Playlist> {
        const url = `${this.PlaylistsUrl}/${id}`;
        let headers = this.authService.initAuthHeaders();
        let options = new RequestOptions({ headers: headers });
        return this.http.get(url, options)
            .toPromise()
            .then((response: Response) => response.json() as Playlist)
            .catch(this.handleError);
    }
    private handleError(error: any): Promise<any> {
        
        console.error('An error occurred', error); // for demo purposes only
        if(error.status == 401)
        {
            console.log("Unauthorized");
        }
        return Promise.reject(error);
    }

    update(Playlist: Playlist): Promise<Playlist> {

        let headers = this.authService.initAuthHeaders();
        const url = `${this.PlaylistsUrl}/${Playlist.Id}`;
        return this.http
            .put(url, Playlist, {headers: headers})
            .toPromise()
            .then(() => 
            {
                this.setPlaylistsModified(true);
                Playlist
            })
            .catch(this.handleError);
    }
    shuffle(Playlist: Playlist): Promise<Playlist> {

        let headers = this.authService.initAuthHeaders();
        const url = this.PlaylistsUrl + "/Shuffle/"+Playlist.Id;
        return this.http
            .put(url, Playlist, {headers: headers})
            .toPromise()
            .then(() => Playlist)
            .catch(this.handleError);
    }
    create(name: string): Promise<Playlist> {
        const tmpPlaylist = new Playlist();
        tmpPlaylist.Name = name;
        let headers = this.authService.initAuthHeaders();
        //tmpHero.name = name;
        return this.http
            .post(this.PlaylistsUrl, tmpPlaylist, {headers: headers})
            .toPromise()
            .then((res: Response) => 
            {
                this.setPlaylistsModified(true);
                res.json();
            })
            .catch(this.handleError);
    }
    delete(id: number): Promise<void> {

        let headers = this.authService.initAuthHeaders();
        const url = `${this.PlaylistsUrl}/${id}`;
        return this.http.delete(url, {headers: headers})
            .toPromise()
            .then(() => 
            {
                this.setPlaylistsModified(true);
                null;
            })
            .catch(this.handleError);
    }
}