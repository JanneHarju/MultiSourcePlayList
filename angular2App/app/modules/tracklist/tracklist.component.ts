import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Renderer,OnDestroy } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { TrackService }         from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { Track } from '../../models/track';
import { SimpleTimer } from 'ng2-simple-timer';
import { Router }                 from '@angular/router';

@Component({
    selector: 'my-tracklist',
    templateUrl: 'tracklist.component.html',
    styles: [ require('./tracklist.component.less') ],
})
export class TracklistComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(
    private trackService: TrackService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private renderer: Renderer,
    private st: SimpleTimer,
    private el: ElementRef,
    private router: Router) { }

    //@ViewChild('play-button') play: ElementRef;
    
    timerId: string;
    tracklist: Track[] = [];
    selectedTrack: Track = new Track();
    notFirstTime: boolean = false;
    trackName: string;
    private id: string = 'yz8i6A6BTiA';
    counter: number = 0;
    
    addTrack()
    {
        this.router.navigate([{ outlets: { popup: 'addtrackpopup' }}]);
        //this.router.navigate([{ outlets: { popup: 'addtrackpopup' }},this.selectedTrack.playlist]);
    
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
        
        //this.st.newTimer('5sec', 5);
        //this.timerId = this.st.subscribe('5sec', e => this.callback());
     }
     ngOnDestroy(): void
    {
        this.st.delTimer('5sec');
    }
     ngAfterViewInit() {

        //this.renderer.invokeElementMethod(this.play.nativeElement, 'click');
     }
     onSelect(track: Track): void {
        this.selectedTrack = track;
        this.playerService.setTrack(this.selectedTrack);
        //this.playTrack();
        
    }
    

    /*onLoad()  {
        this.trackName = "ladattu";
        let iframe = document.getElementById('spotify');
        let doc = (<HTMLIFrameElement>iframe).contentDocument;
        let playbutton = doc.getElementById("play-button")
        if(playbutton != null)
        {
            playbutton.click();

            let name = doc.getElementById("track-name").innerText;
            let artist = doc.getElementById("track-artists").innerText;
            this.trackName = artist + " - " + name;
            //console.log(++this.counter);
        }
        //console.log(++this.counter);
        //doc.getElementById("play-button").click();
    }*/
    /*onYoutubeLoaded()  {
        let iframe = document.getElementById('youtube');
        let doc = (<HTMLIFrameElement>iframe).contentDocument;
        let a = (<HTMLLinkElement>doc.getElementsByClassName('ytp-title-link')[0]);
        this.trackName = a.getElementsByTagName("span")[1].textContent;
    }*/
    audioloaded()
    {
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        //this.trackName = audio.audioTracks.length.toString();//[0].label + " " + audio.audioTracks[0].kind;
        //audio.load();
        audio.play();
        //this.trackName = audio.audioTracks.toString();//[0].label + " " + audio.audioTracks[0].kind;
    }
    onAudioEnded()
    {
        //Call service here to choose next track
        //this.chooseNextTrack();
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
}