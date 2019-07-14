import { Injectable } from '@angular/core';

import { Track } from '../models/track';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private tracksUrl = `${environment.backendUrl}/api/tracks`; // URL to web api

  // private headers = new Headers({'Content-Type': 'application/json'});
  constructor(private http: HttpClient, private authService: AuthService) {}

  getTracks(): Promise<Track[]> {
    const headers = this.authService.initAuthHeaders();
    const options = { headers: headers };
    return this.http
      .get<Track[]>(this.tracksUrl, options)
      .toPromise()
      .then((response) => response)
      .catch(this.handleError);
  }
  getPlaylistTracks(id: number): Promise<Track[]> {
    const playlist = 'true';
    /*let params: URLSearchParams = new URLSearchParams();
        params.set('playlist', playlist);
        let requestOptions = );
        requestOptions.search = params;*/

    const headers = this.authService.initAuthHeaders();
    const options = { headers: headers };
    const url = `${this.tracksUrl}/${id}/${playlist}`;
    return this.http
      .get<Track[]>(url, options)
      .toPromise()
      .then((response) => response)
      .catch(this.handleError);
  }
  searchTracks(query: string): Promise<Track[]> {
    const headers = this.authService.initAuthHeaders();
    const options = { headers: headers };
    const url = `${this.tracksUrl}/searchtrack/${query}`;
    return this.http
      .get<Track[]>(url, options)
      .toPromise()
      .then((response) => response)
      .catch(this.handleError);
  }
  getTrack(id: number): Promise<Track> {
    const headers = this.authService.initAuthHeaders();
    const options = { headers: headers };
    const url = `${this.tracksUrl}/${id}`;
    return this.http
      .get<Track>(url, options)
      .toPromise()
      .then((response) => response)
      .catch(this.handleError);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  updatePlaylistOrder(tracks: Track[]) {
    const headers = this.authService.initAuthHeaders();
    return this.http
      .put(this.tracksUrl, tracks, { headers: headers })
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }
  update(track: Track): Promise<Track> {
    const headers = this.authService.initAuthHeaders();
    const url = `${this.tracksUrl}/${track.Id}`;
    return this.http
      .put(url, track, { headers: headers })
      .toPromise()
      .then(() => track)
      .catch(this.handleError);
  }
  create(track: Track): Promise<void> {
    const headers = this.authService.initAuthHeaders();
    // tmpHero.name = name;
    return this.http
      .post(this.tracksUrl, track, { headers: headers })
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }
  createMany(tracks: Track[]): Promise<void> {
    const headers = this.authService.initAuthHeaders();
    // tmpHero.name = name;
    return this.http
      .post(this.tracksUrl, tracks, { headers: headers })
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }
  delete(id: number): Promise<void> {
    const headers = this.authService.initAuthHeaders();
    const url = `${this.tracksUrl}/${id}`;
    return this.http
      .delete(url, { headers: headers })
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }
}
