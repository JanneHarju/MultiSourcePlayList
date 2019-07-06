import { Injectable } from '@angular/core';
import { Track } from '../models/track';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { TrackService } from '../services/track.service';
import { SpotifyService } from '../services/spotify.service';
import { SpotifyPlaybackSdkService } from './spotify-playback-sdk.service';

@Injectable()
export class PlayerService {
  private subject = new BehaviorSubject<Track>(new Track());
  track: Track = new Track();
  lastOrder = -1;
  tracklist: Track[] = [];
  queueTracklist: Track[] = [];
  random = 0;
  public shuffle: boolean;
  subscriptionTrackEnd: Subscription;
  subscriptionTrackEndFromSDK: Subscription;
  constructor(
    private trackService: TrackService,
    private spotifyService: SpotifyService,
    private spotifyPlaybackService: SpotifyPlaybackSdkService
  ) {
    this.subscriptionTrackEndFromSDK = this.spotifyPlaybackService.getTrackEnd().subscribe((trackEnd) => {
      if (trackEnd) {
        this.chooseNextTrack();
      }
    });
  }

  setTrack(newTrack: Track) {
    this.track = newTrack;
    this.subject.next(this.track);
  }
  getTrack(): Observable<Track> {
    return this.subject.asObservable();
  }
  getQueueTracks(): Track[] {
    return this.queueTracklist;
  }
  setTrackList(tracklist: Track[]) {
    this.tracklist = tracklist;
  }
  setCurrentTrackOrder() {
    if (this.track && this.tracklist) {
      const newTrack = this.tracklist.find((t) => t.Id === this.track.Id);
      if (newTrack) {
        const currentTrackNewOrder = newTrack.Order;
        this.track.Order = currentTrackNewOrder;
      }
    }
  }
  chooseNextTrack() {
    if (this.queueTracklist.length > 0) {
      if (this.tracklist.find((x) => x.Id === this.track.Id)) {
        this.lastOrder = this.track.Order;
      }
      this.setTrack(this.queueTracklist.shift());
      // this.setQueue(this.queueTracklist);
    } else {
      if (!this.shuffle) {
        const order = this.lastOrder === -1 ? this.track.Order : this.lastOrder;
        const nextTracks = this.tracklist.filter((x) => x.Order > order);
        if (nextTracks != null && nextTracks.length > 0) {
          this.setTrack(nextTracks[0]);
        } else {
          this.setTrack(this.tracklist[0]);
        }
        this.lastOrder = -1;
      } else {
        this.chooseNextRandomTrack();
      }
    }
  }
  choosePreviousTrack() {
    const nextTracks = this.tracklist.filter((x) => x.Order < this.track.Order);
    if (nextTracks != null && nextTracks.length > 0) {
      this.setTrack(nextTracks[nextTracks.length - 1]);
    } else {
      this.setTrack(this.tracklist[this.tracklist.length - 1]);
    }
  }
  chooseNextRandomTrack() {
    this.random = Math.floor(Math.random() * this.tracklist.length);
    this.setTrack(this.tracklist[this.random]);
  }
  isCurrentlyPlayingTrackThisPlaylistTrack(playlistId: number): boolean {
    return this.track && this.track.Playlist && this.track.Playlist.Id === playlistId;
  }
  addTrackToQueue(track: Track) {
    this.queueTracklist.push(track);
    // this.setQueue(this.queueTracklist);
  }
}
