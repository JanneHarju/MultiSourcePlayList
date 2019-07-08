import { Injectable } from '@angular/core';
import { SpotifyService } from './spotify.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SimpleTimer } from 'ng2-simple-timer';
/// <reference path="../node_modules/@types/spotify-web-playback-sdk/index.d.ts"/>

declare global {
  interface window {
    onSpotifyWebPlaybackSDKReady: () => void;
    spotifyReady: Promise<void>;
  }
}

@Injectable()
export class SpotifyPlaybackSdkService {
  private player: Spotify.SpotifyPlayer;
  private deviceId: string;
  private state: Spotify.PlaybackState;

  private subjectPlayState = new BehaviorSubject<Spotify.PlaybackState>(null);
  private subjectTrackEnded = new BehaviorSubject<boolean>(false);
  playStatusTimerId: string;
  constructor(private spotifyService: SpotifyService, private st: SimpleTimer) {}
  addSpotifyPlaybackSdk() {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.type = 'text/javascript';
    script.addEventListener('load', (e) => {
      console.log(e);
    });
    document.head.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('The Web Playback SDK is ready. We have access to Spotify.Player');
      // console.log(window.Spotify.Player);
      this.player = new Spotify.Player({
        name: 'Musiple',
        volume: +localStorage.getItem('musiple-volume') / 100,
        getOAuthToken: (callback) => {
          callback(localStorage.getItem('spotify-access-token'));
        }
      });
      this.player.connect().then((res) => {
        console.log(res);
      });
      // Ready
      this.player.on('ready', (data) => {
        console.log('Ready with Device ID', data.device_id);
        this.deviceId = data.device_id;
        this.spotifyService.deviceId = this.deviceId;
      });

      this.player.addListener('player_state_changed', (state) => {
        console.log(state);
        if (
          this.state &&
          state.track_window.previous_tracks.find((x) => x.id === state.track_window.current_track.id) &&
          !this.state.paused &&
          state.paused
        ) {
          console.log('Track ended');
          this.setTrackEnd(true);
        }
        this.state = state;
      });
    };
  }

  setPlayState(state: Spotify.PlaybackState) {
    this.state = state;
    this.subjectPlayState.next(state);
  }
  getPlayStatus(): Observable<Spotify.PlaybackState> {
    return this.subjectPlayState.asObservable();
  }
  setTrackEnd(trackEnd: boolean) {
    this.subjectTrackEnded.next(trackEnd);
  }
  getTrackEnd(): Observable<boolean> {
    return this.subjectTrackEnded.asObservable();
  }
  startTimer() {
    this.st.delTimer('spotifyPlayback');
    this.st.newTimer('spotifyPlayback', 1);
    this.playStatusTimerId = this.st.subscribe('spotifyPlayback', (e) => this.callback());
  }
  removeTimer() {
    this.st.delTimer('spotifyPlayback');
  }
  callback() {
    this.player.getCurrentState().then((state) => {
      this.setPlayState(state);
    });
  }
}
