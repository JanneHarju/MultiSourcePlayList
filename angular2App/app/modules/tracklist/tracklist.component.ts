import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Renderer,OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TrackService } from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { PlaylistService } from '../../services/playlist.service';
import { AuthService } from '../../services/auth.service';
import { MusixMatchAPIService } from '../../services/musixmatch.service';
import { LoadingService }         from '../../services/loading.service';
import { Track } from '../../models/track';
import { Playlist } from '../../models/playlist';
import { MusixMatchLyric } from '../../models/musixmatchlyric';
import { SimpleTimer } from 'ng2-simple-timer';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'my-tracklist',
    templateUrl: 'tracklist.component.html',
    styleUrls: [ './tracklist.component.less' ],
})
export class TracklistComponent implements OnInit, AfterViewInit, OnDestroy {

    timerId: string;
    tracklist: Track[] = [];
    notFirstTime: boolean = false;
    trackName: string;
    private id: string = 'yz8i6A6BTiA';
    counter: number = 0;
    closeResult: string;
    lyric: string = "";
    lyricHeader: string = "";
    lyricImageUrl: string = "";
    currentTrack: Track = new Track();
    currrentPlaylist: Playlist = new Playlist();
    subscriptionTrack: Subscription;
    subscriptionPlaylistsModified: Subscription;
    playlists: Playlist[] = [];

    constructor(
        private trackService: TrackService,
        private playerService: PlayerService,
        private playlistService: PlaylistService,
        private musixmatchService: MusixMatchAPIService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private renderer: Renderer,
        private st: SimpleTimer,
        private el: ElementRef,
        private router: Router,
        private loadingService: LoadingService)
    { }

    ngOnInit() {
        this.getPlaylistTracks();

        this.route.params
            .switchMap((params: Params) => 
            {
                return this.playlistService.getPlaylist(+params['id']);
            })
            .subscribe((playlist: Playlist) => 
            {
                this.currrentPlaylist = playlist;
            });
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => 
        {
            this.selectCurrentTrack(track);
        });

        this.getUsersPlaylistsasync();
        this.subscriptionPlaylistsModified = this.playlistService.getPlaylistsModified().subscribe(updated =>
        {
            this.getUsersPlaylists();
        });
     }
     getPlaylistTracks()
     {
        this.route.params
            .switchMap((params: Params) => 
            {
                setTimeout(()=> this.loadingService.setLoading(true));
                return this.trackService.getPlaylistTracks(+params['id']);
            })
            .subscribe((tracklist: Track[]) => 
            {
                this.tracklist = tracklist;
                if(this.tracklist.length > 0)
                {
                    if(this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tracklist[0].Playlist.Id))
                    {
                        this.playerService.setTrackList(this.tracklist);
                        this.selectCurrentTrack(this.playerService.track);
                        this.playerService.setCurrentTrackOrder();
                    }
                }
                setTimeout(()=> this.loadingService.setLoading(false));
            },error =>
            {
                setTimeout(()=> this.loadingService.setLoading(false));
            });
     }
     getUsersPlaylists()
     {
         this.playlistService.getUsersPlaylists()
            .then((playlists : Playlist[])=> 
            {
                this.playlists = playlists;
                this.playlists = this.playlists.filter(h => h.Id !== this.currrentPlaylist.Id);
            })
            .catch(err =>
            {
                console.log("Some error occured" + err);
                if(err.status == 401)
                {
                    console.log("Unauthorized");
                    this.authService.clearLoginToken();
                    this.router.navigate(['login']);
                }
            });
     }
     getUsersPlaylistsasync()
     {
         this.route.params
            .switchMap((params: Params) =>
                this.playlistService.getUsersPlaylists())
                .subscribe((playlists : Playlist[])=> 
                {
                    this.playlists = playlists;
                    this.playlists = this.playlists.filter(h => h.Id !== this.currrentPlaylist.Id);
                });
     }
     ngOnDestroy(): void
     {
         this.subscriptionPlaylistsModified.unsubscribe();
         this.subscriptionTrack.unsubscribe();
        this.st.delTimer('5sec');
     }
     selectCurrentTrack(track: Track)
     {
         if(this.tracklist[0] && this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tracklist[0].Playlist.Id))
         {
            let temptrack = this.tracklist.find(x=>x.Address == track.Address);
            if(temptrack)
            {
                this.currentTrack = temptrack;
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
    
    delete(track: Track)
    {
        this.loadingService.setLoading(true);
        this.trackService
            .delete(track.Id)
            .then(() => {
                this.tracklist = this.tracklist.filter(h => h !== track);
                if (this.currentTrack === track) { this.currentTrack = null; }
                this.ngOnInit();
                this.loadingService.setLoading(false);
            })
            .catch(err=>
            {
                this.loadingService.setLoading(false);
            });
    }
    lyrics(track: Track) {
        this.lyricHeader = track.Name;
        this.lyric = "";
        this.lyricImageUrl = "";
        this.musixmatchService.search(track.Name)
            .subscribe(lyrics => 
            {

                if(lyrics)
                {
                    this.lyric = lyrics.lyrics_body;
                    this.lyricImageUrl = lyrics.pixel_tracking_url;
                }
                else
                    this.lyric = "Lyrics could not be found.";
            });
    }
    orderedTrack()
    {

        this.loadingService.setLoading(true);
        this.trackService
            .updatePlaylistOrder(this.tracklist)
            .then(() => {
                this.loadingService.setLoading(false);
                this.getPlaylistTracks();
            })
            .catch(error =>
            {
                this.loadingService.setLoading(false);
            });
    }
    loadComplited(e: any)
    {
        this.ngOnInit();
    }
    addTrackToPlaylist(playlist: Playlist, track: Track)
    {
        let trc = new Track();
        trc.Address = track.Address;
        trc.Name = track.Name;
        trc.Playlist = playlist;
        trc.Type = track.Type;
        let trackList: Track[] = [];
        trackList.push(trc);
        this.trackService.createMany(trackList).then(ret =>
        {

        });
    }
    addToQueue(track: Track)
    {
        this.playerService.addTrackToQueue(track);
    }
}