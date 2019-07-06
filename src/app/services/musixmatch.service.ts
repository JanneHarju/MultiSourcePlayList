import { throwError as observableThrowError } from 'rxjs';

import { Injectable } from '@angular/core';
import { MusixMatchLyric } from '../models/musixmatchlyric';
import { HttpRequestOptions } from './spotify.service';

import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface MusixMatchOptions {
  apikey?: string;
  q_track?: string;
  q_artist?: string;
  maxResults?: number;
  format?: string;
  callback?: string;
}

@Injectable()
export class MusixMatchAPIService {
  baseUri = 'https://api.musixmatch.com/ws/1.1/';
  key = '4580db683fb8c0d7073ec8fc7ce2c474';
  constructor(private http: HttpClient) {}
  search(q: string) {
    const artist = this.getArtistFromQuery(q);
    const track = this.getTrackFromQuery(q);
    let options: MusixMatchOptions;
    options = {};
    options.format = 'jsonp';
    options.callback = 'callback';
    options.apikey = this.key;
    options.q_artist = artist;
    options.q_track = track;
    return this.http
      .get<any>(`${this.baseUri}matcher.lyrics.get`, {
        params: this.makeHttpParams(options)
      })
      .pipe(
        map((res) => {
          const body = res.text();
          const callback = 'callback(';
          const callbackEnd = ');';
          const part1 = body.split(callback)[1];
          const part2 = part1.split(callbackEnd)[0];
          // return part2;
          return JSON.parse(part2).message.body.lyrics as MusixMatchLyric;
        })
      ); // .message.body.lyrics as MusixMatchLyric);
  }

  private toQueryString(obj: Object): string {
    const parts: string[] = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent((<any>obj)[key]));
      }
    }
    return parts.join('&');
  }
  private makeHttpParams(options: any): HttpParams {
    let params = new HttpParams();
    Object.keys(options).forEach((e) => (params = params.set(e, options[e])));
    return params;
  }
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

  private handleError(error: any) {
    console.error(error);
    return observableThrowError(error.json().error || 'Server error');
  }
  getArtistFromQuery(q: string): string {
    const parts = q.split(' - ');
    let artist = '';
    if (parts != null && parts.length > 0) {
      artist = parts[0];
    }
    return artist;
  }
  getTrackFromQuery(q: string): string {
    const parts = q.split(' - ');
    let track = '';
    if (parts != null && parts.length > 1) {
      track = parts[1];
    }
    return track;
  }
}
