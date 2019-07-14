
import {switchMap} from 'rxjs/operators';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TrackService } from '../../../../services/track.service';
import { PlayerService } from '../../../../services/player.service';
import { PlaylistService } from '../../../../services/playlist.service';
import { AuthService } from '../../../../services/auth.service';
import { MusixMatchAPIService } from '../../../../services/musixmatch.service';
import { LoadingService } from '../../../../services/loading.service';
import { Track } from '../../../../models/track';
import { Playlist } from '../../../../models/playlist';
import { MusixMatchLyric } from '../../../../models/musixmatchlyric';
import { SimpleTimer } from 'ng2-simple-timer';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'my-tracklist',
    templateUrl: 'tracklist.component.html',
    styleUrls: [ './tracklist.component.css' ],
})
export class TracklistComponent implements OnInit, AfterViewInit, OnDestroy {

    timerId: string;
    tracklist: Track[] = [];
    notFirstTime = false;
    trackName: string;
    counter = 0;
    closeResult: string;
    lyric = '';
    lyricHeader = '';
    lyricImageUrl = '';
    currentTrack: Track = new Track();
    currentPlaylist: Playlist = new Playlist();
    subscriptionTrack: Subscription;
    subscriptionPlaylistsModified: Subscription;
    playlists: Playlist[] = [];
    newTrack: Track = new Track();
    constructor(
        private trackService: TrackService,
        private playerService: PlayerService,
        private playlistService: PlaylistService,
        private musixmatchService: MusixMatchAPIService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private st: SimpleTimer,
        private router: Router,
        private loadingService: LoadingService) { }

    ngOnInit() {
        this.getPlaylistTracks();

        this.route.params.pipe(
            switchMap((params: Params) => {
                return this.playlistService.getPlaylist(+params['id']);
            }))
            .subscribe((playlist: Playlist) => {
                this.currentPlaylist = playlist;
            });
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => {
            this.selectCurrentTrack(track);
        });

        this.getUsersPlaylistsasync();
        this.subscriptionPlaylistsModified = this.playlistService.getPlaylistsModified().subscribe(() => {
            this.getUsersPlaylists();
        });
     }
     getPlaylistTracks() {
        this.route.params.pipe(
            switchMap((params: Params) => {
                this.loadingService.setLoading(true);
                return this.trackService.getPlaylistTracks(+params['id']);
            }))
            .subscribe((tracklist: Track[]) => {
                this.tracklist = tracklist;
                if (this.tracklist.length > 0) {
                    if (this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tracklist[0].Playlist.Id)) {
                        this.playerService.setTrackList(this.tracklist);
                        this.selectCurrentTrack(this.playerService.track);
                        this.playerService.setCurrentTrackOrder();
                    }
                }
                this.loadingService.setLoading(false);
            }, () => {
                this.loadingService.setLoading(false);
            });
     }
     getUsersPlaylists() {
         this.playlistService.getUsersPlaylists()
            .then((playlists: Playlist[]) => {
                this.playlists = playlists;
                this.playlists = this.playlists.filter(h => h.Id !== this.currentPlaylist.Id);
            })
            .catch(err => {
                console.log('Some error occured' + err);
                if (err.status === 401) {
                    console.log('Unauthorized');
                    this.authService.clearLoginToken();
                    this.router.navigate(['/login']);
                }
            });
     }
     getUsersPlaylistsasync() {
         this.route.params.pipe(
            switchMap(() =>
                this.playlistService.getUsersPlaylists()))
                .subscribe((playlists: Playlist[]) => {
                    this.playlists = playlists;
                    this.playlists = this.playlists.filter(h => h.Id !== this.currentPlaylist.Id);
                });
     }
     ngOnDestroy(): void {
         this.subscriptionPlaylistsModified.unsubscribe();
         this.subscriptionTrack.unsubscribe();
        this.st.delTimer('5sec');
     }
     selectCurrentTrack(track: Track) {
         if (this.tracklist[0] && this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tracklist[0].Playlist.Id)) {
            const temptrack = this.tracklist.find(x => x.Address === track.Address);
            if (temptrack) {
                this.currentTrack = temptrack;
                const trackElement: HTMLElement = document.getElementById(this.getTrackElementName(this.currentTrack.Id));
                if (trackElement && !this.isElementInViewport(trackElement)) {
                    trackElement.scrollIntoView({behavior: 'smooth'});
                }
            }
         }
     }
     ngAfterViewInit() {

     }
     onSelect(track: Track): void {
        this.playerService.setTrackList(this.tracklist);
        this.currentTrack = track;
        this.playerService.setTrack(this.currentTrack);
    }

    delete(track: Track) {
        this.loadingService.setLoading(true);
        this.trackService
            .delete(track.Id)
            .then(() => {
                this.tracklist = this.tracklist.filter(h => h !== track);
                if (this.currentTrack === track) { this.currentTrack = null; }
                this.ngOnInit();
                this.loadingService.setLoading(false);
            })
            .catch(() => {
                this.loadingService.setLoading(false);
            });
    }
    lyrics(track: Track) {
        this.lyricHeader = track.Name;
        this.lyric = '';
        this.lyricImageUrl = '';
        this.musixmatchService.search(track.Name)
            .subscribe(lyrics => {

                if (lyrics) {
                    this.lyric = lyrics.lyrics_body;
                    this.lyricImageUrl = lyrics.pixel_tracking_url;
                } else {
                    this.lyric = 'Lyrics could not be found.';
                }
            });
    }
    orderedTrack() {
        this.loadingService.setLoading(true);
        this.trackService
            .updatePlaylistOrder(this.tracklist)
            .then(() => {
                this.loadingService.setLoading(false);
                this.getPlaylistTracks();
            })
            .catch(() => {
                this.loadingService.setLoading(false);
            });
    }
    loadComplited(e: any) {
        this.ngOnInit();
    }
    addTrackToPlaylist(playlist: Playlist, track: Track) {
        const trc = new Track();
        trc.Address = track.Address;
        trc.Name = track.Name;
        trc.Playlist = playlist;
        trc.Type = track.Type;
        const trackList: Track[] = [];
        trackList.push(trc);
        this.trackService.createMany(trackList).then(() => {

        });
    }
    addToQueue(track: Track) {
        this.playerService.addTrackToQueue(track);
    }

    getTrackElementName(trackId: Number) {
        return 'track_' + trackId;
    }

    isElementInViewport (el: HTMLElement): boolean {
        const rect = el.getBoundingClientRect();
        const viewPortElement = document.getElementById('body-content');
        const viewPortElementRect = viewPortElement.getBoundingClientRect();
        return (
            rect.top >= viewPortElementRect.top &&
            rect.bottom <= viewPortElementRect.bottom
        );
    }

    clearNewTrack() {
        this.newTrack = new Track();
        this.newTrack.Type = 4;
        this.newTrack.Playlist = this.currentPlaylist;
    }
    addNewTrack() {
        console.log(this.newTrack);
        if(this.newTrack.Address != '' && this.newTrack.Name != '') {
            const trackList: Track[] = [];
            trackList.push(this.newTrack);
            this.trackService.createMany(trackList).then(() => {
                this.getPlaylistTracks();
            });
        }
    }
}
