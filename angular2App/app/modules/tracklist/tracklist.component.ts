import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Renderer,OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TrackService } from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { MusixMatchAPIService } from '../../services/musixmatch.service';
import { Track } from '../../models/track';
import { MusixMatchLyric } from '../../models/musixmatchlyric';
import { SimpleTimer } from 'ng2-simple-timer';
import { Router } from '@angular/router';

@Component({
    selector: 'my-tracklist',
    templateUrl: 'tracklist.component.html',
    styles: [ require('./tracklist.component.less') ],
})
export class TracklistComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(
    private trackService: TrackService,
    private playerService: PlayerService,
    private musixmatchService: MusixMatchAPIService,
    private route: ActivatedRoute,
    private renderer: Renderer,
    private st: SimpleTimer,
    private el: ElementRef,
    private router: Router) { }
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
                    //this.playerService.setTrack(this.selectedTrack);
                }
            });
     }
     ngOnDestroy(): void
    {
        this.st.delTimer('5sec');
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
}