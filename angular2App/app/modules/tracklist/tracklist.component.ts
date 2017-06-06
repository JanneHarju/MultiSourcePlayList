import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Renderer,OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TrackService } from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { PlaylistService } from '../../services/playlist.service';
import { MusixMatchAPIService } from '../../services/musixmatch.service';
import { Track } from '../../models/track';
import { Playlist } from '../../models/playlist';
import { MusixMatchLyric } from '../../models/musixmatchlyric';
import { SimpleTimer } from 'ng2-simple-timer';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'my-tracklist',
    templateUrl: 'tracklist.component.html',
    styles: [ require('./tracklist.component.less') ],
})
export class TracklistComponent implements OnInit, AfterViewInit, OnDestroy {

    timerId: string;
    tracklist: Track[] = [];
    selectedTrack: Track = new Track();
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
    playlists: Playlist[] = [];

    constructor(
    private trackService: TrackService,
    private playerService: PlayerService,
    private playlistService: PlaylistService,
    private musixmatchService: MusixMatchAPIService,
    private route: ActivatedRoute,
    private renderer: Renderer,
    private st: SimpleTimer,
    private el: ElementRef,
    private router: Router) { }
    addTrack()
    {
        this.router.navigate([{ outlets: { popup: 'addtrackpopup' }}]);
    }
    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.trackService.getPlaylistTracks(+params['id']))
            .subscribe((tracklist: Track[]) => 
            {
                this.tracklist = tracklist;
                if(this.tracklist.length > 0)
                {
                    this.selectedTrack = tracklist[0];
                    this.playerService.setTrackList(this.tracklist);
                    this.selectCurrentTrack(this.playerService.track);
                    //this.playerService.setTrack(this.selectedTrack);
                }
            });
         this.route.params
            .switchMap((params: Params) => this.playlistService.getPlaylist(+params['id']))
            .subscribe((playlist: Playlist) => 
            {
                this.currrentPlaylist = playlist;
            });
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => 
        {
            this.selectCurrentTrack(track);
        });

        this.playlistService.getUsersPlaylists()
            .then((playlists : Playlist[])=> 
            {
                this.playlists = playlists;

                this.playlists = this.playlists.filter(h => h.id !== this.currrentPlaylist.id);
            });
     }
     ngOnDestroy(): void
     {
        this.st.delTimer('5sec');
     }
     selectCurrentTrack(track: Track)
     {
        let temptrack = this.tracklist.find(x=>x.address == track.address);
            if(temptrack)
            {
                this.currentTrack = temptrack;
            }
     }
     ngAfterViewInit() {

     }
     onSelect(track: Track): void {
        this.selectedTrack = track;
        this.playerService.setTrack(this.selectedTrack);
        
    }
    
    audioloaded()
    {
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        audio.play();
    }
    
    delete(track: Track)
    {
        this.trackService
            .delete(track.id)
            .then(() => {
                this.tracklist = this.tracklist.filter(h => h !== track);
                if (this.selectedTrack === track) { this.selectedTrack = null; }
                this.ngOnInit();
            });
    }
    lyrics(track: Track) {
        this.lyricHeader = track.name;
        this.lyric = "";
        this.lyricImageUrl = "";
        this.musixmatchService.search(track.name)
            .subscribe(lyrics => 
            {

                if(lyrics)
                {
                    this.lyric = lyrics.lyrics_body;
                    this.lyricImageUrl = lyrics.pixel_tracking_url;
                }
                else
                    this.lyric = "Lyrics dosen't found.";
            });
    }
    orderedTrack()
    {
        this.trackService
            .updatePlaylistOrder(this.tracklist)
            .then(() => {
                this.ngOnInit();
            });
    }
    loadComplited(e: any)
    {
        this.ngOnInit();
    }
    addTrackToPlaylist(playlist: Playlist, track: Track)
    {
        let trc = new Track();
        trc.address = track.address;
        trc.name = track.name;
        trc.playlist = playlist;
        trc.type = track.type;
        let trackList: Track[] = [];
        trackList.push(trc);
        this.trackService.createMany(trackList).then(ret =>
        {

        });
    }
}