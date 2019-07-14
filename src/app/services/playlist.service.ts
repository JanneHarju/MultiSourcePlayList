import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Playlist } from '../models/playlist';
import { Subject, Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private PlaylistsUrl = `${environment.backendUrl}/api/playlists`; // URL to web api

  private playlistsModified = new Subject<boolean>();
  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}
  setPlaylistsModified(modified: boolean) {
    this.playlistsModified.next(modified);
  }
  getPlaylistsModified(): Observable<boolean> {
    return this.playlistsModified.asObservable();
  }
  getPlaylists(): Promise<Playlist[]> {
    const headers = this.authService.initAuthHeaders();
    const options = { headers: headers };
    return this.http
      .get<Playlist[]>(this.PlaylistsUrl, options)
      .toPromise()
      .then((response) => response)
      .catch(this.handleError);
  }
  getUsersPlaylists(): Promise<Playlist[]> {
    const headers = this.authService.initAuthHeaders();
    const options = { headers: headers };
    const url = this.PlaylistsUrl + '/GetUsersPlaylists';
    return this.http
      .get<Playlist[]>(url, options)
      .toPromise()
      .then((response) => response)
      .catch(this.handleError);
  }
  getPlaylist(id: number): Promise<Playlist> {
    const url = `${this.PlaylistsUrl}/${id}`;
    const headers = this.authService.initAuthHeaders();
    const options = { headers: headers };
    return this.http
      .get<Playlist>(url, options)
      .toPromise()
      .then((response) => response)
      .catch(this.handleError);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    if (error.status === 401) {
      console.log('Unauthorized');
    }
    return Promise.reject(error);
  }

  update(playlist: Playlist): Promise<Playlist> {
    const headers = this.authService.initAuthHeaders();
    const url = `${this.PlaylistsUrl}/${playlist.Id}`;
    return this.http
      .put(url, playlist, { headers: headers })
      .toPromise()
      .then(() => {
        this.setPlaylistsModified(true);
      })
      .catch(this.handleError);
  }
  shuffle(playlist: Playlist): Promise<Playlist> {
    const headers = this.authService.initAuthHeaders();
    const url = this.PlaylistsUrl + '/Shuffle/' + playlist.Id;
    return this.http
      .put(url, playlist, { headers: headers })
      .toPromise()
      .then(() => playlist)
      .catch(this.handleError);
  }
  create(name: string): Promise<Playlist> {
    const tmpPlaylist = new Playlist();
    tmpPlaylist.Name = name;
    const headers = this.authService.initAuthHeaders();
    // tmpHero.name = name;
    return this.http
      .post(this.PlaylistsUrl, tmpPlaylist, { headers: headers })
      .toPromise()
      .then((res: Response) => {
        this.setPlaylistsModified(true);
        res.json();
      })
      .catch(this.handleError);
  }
  delete(id: number): Promise<void> {
    const headers = this.authService.initAuthHeaders();
    const url = `${this.PlaylistsUrl}/${id}`;
    return this.http
      .delete(url, { headers: headers })
      .toPromise()
      .then(() => {
        this.setPlaylistsModified(true);
      })
      .catch(this.handleError);
  }
}
