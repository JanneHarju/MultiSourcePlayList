import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Renderer,OnDestroy } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { TrackService }         from '../../services/track.service';
import { Track } from '../../models/track';
import { SimpleTimer } from 'ng2-simple-timer';

@Component({
    selector: 'my-tracklist',
    templateUrl: 'tracklist.component.html',
    styles: [ require('./tracklist.component.less') ],
})
export class TracklistComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(
    private trackService: TrackService,
    private route: ActivatedRoute,
    private renderer: Renderer,
    private st: SimpleTimer,
    private el: ElementRef) { }

    //@ViewChild('play-button') play: ElementRef;
    
    timerId: string;
    tracklist: Track[] = [];
    selectedTrack: Track = new Track();
    notFirstTime: boolean = false;
    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.trackService.getPlaylistTracks(+params['id']))
            .subscribe(tracklist => 
            {
                this.tracklist = tracklist
                if(this.tracklist.length > 0)
                {
                    this.selectedTrack = tracklist[0];
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
        if(this.selectedTrack != null)
        {
            switch (this.selectedTrack.type) {
                case 1://youtube
                    
                    this.selectedTrack.address += "&autoplay=1";
                    break;
                case 2://spotify
                    
                    /*let iframe = document.getElementById('spotify');
                    let doc = (<HTMLIFrameElement>iframe).contentDocument 
                    let playbutton = doc.getElementById("play-button");
                    playbutton.click();*/
                    break;
                case 3://mp3
                    
                    /*let audio = (<HTMLAudioElement>document.getElementById("audio1"));
                    audio.play();*/
                    break;
                default:
                    break;
            }
        }
        
    }
    play()
    {
        if(this.selectedTrack != null)
        {
            switch (this.selectedTrack.type) {
                case 1://youtube
                    
                    break;
                case 2://spotify
                    
                    let iframe = document.getElementById('spotify');
                    let doc = (<HTMLIFrameElement>iframe).contentDocument 
                    let playbutton = doc.getElementById("play-button");
                    playbutton.click();
                    break;
                case 3://mp3
                    
                    let audio = (<HTMLAudioElement>document.getElementById("audio1"));
                    audio.play();
                    break;
                default:
                    break;
            }
        
        }
    }
    pause()
    {
        if(this.selectedTrack != null)
        {
            switch (this.selectedTrack.type) {
                case 1://youtube
                    
                    break;
                case 2://spotify
                    
                    let iframe = document.getElementById('spotify');
                    let doc = (<HTMLIFrameElement>iframe).contentDocument 
                    let playbutton = doc.getElementById("play-button");
                    playbutton.click();
                    break;
                case 3://mp3
                    
                    let audio = (<HTMLAudioElement>document.getElementById("audio1"));
                    audio.pause();
                    break;
                default:
                    break;
            }
        
        }
    }
    onLoad()  {
        var iframe = document.getElementById('spotify');
        var doc = (<HTMLIFrameElement>iframe).contentDocument 
        doc.getElementById("play-button").click();
    }
    audioloaded()
    {
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        audio.pause();
    }
    onYoutubeEnded()
    {
        this.selectedTrack = this.tracklist[3];
        if(this.selectedTrack.type == 1)
        {
            this.selectedTrack.address += "&autoplay=1";
        }
    }
    onAudioEnded()
    {
        this.selectedTrack = this.tracklist[3];
        if(this.selectedTrack.type == 1)
        {
            this.selectedTrack.address += "&autoplay=1";
        }
    }
}