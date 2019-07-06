
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { YoutubeVideo } from '../models/youtubeVideo';
import { HttpRequestOptions } from './spotify.service';


import { HttpClient, HttpParams } from '@angular/common/http';

export interface YoutubeOptions {
  part?: string;
  type?: string;
  q?: string;
  key?: string;
  maxResults?: number;
}

@Injectable()
export class YoutubeAPIService {
  baseUri = 'https://www.googleapis.com/youtube/v3';
  key = 'AIzaSyCBJf1-O0F4J37lTx7Avlfk5hTWYBydWQE';
  constructor(private http: HttpClient) {}

  search(q: string) {
    let options: YoutubeOptions;
    options = {};
    options.q = q;
    options.type = 'video';
    options.key = this.key;
    options.part = 'snippet';
    options.maxResults = 20;
    return this.http
      .get<any>(`${this.baseUri}/search`, {
        params: this.makeHttpParams(options)
      }).pipe(
      map(res => res.items as YoutubeVideo[]));
  }

  private makeHttpParams(options: any): HttpParams {
    let params = new HttpParams();
    Object.keys(options).forEach(e => (params = params.set(e, options[e])));
    return params;
  }
}
