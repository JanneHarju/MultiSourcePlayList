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
    trackName: string;
    player: YT.Player;
    private id: string = 'yz8i6A6BTiA';
    counter: number = 0;
    savePlayer (player: YT.Player) {
        this.player = player;
        console.log('player instance', player)
        }
    onStateChange(event : YT.EventArgs){
        console.log('player state', event.data);
        if(event.data == 0)
        {
            //Chose next track
            this.selectedTrack = this.tracklist[1];
        }
        else
        {
            let data = this.player.getVideoData()
            this.trackName = data.title;
        }
    }
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
                    this.player.loadVideoById(this.selectedTrack.address);
                    this.player.playVideo();
                    //this.selectedTrack.address += "&autoplay=1";
                    break;
                case 2://spotify
                    
                    this.player.pauseVideo();
                    /*let iframe = document.getElementById('spotify');
                    let doc = (<HTMLIFrameElement>iframe).contentDocument 
                    let playbutton = doc.getElementById("play-button");
                    playbutton.click();*/
                    break;
                case 3://mp3
                    
                    this.player.pauseVideo();
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
                    this.player.playVideo();
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
                    
                    this.player.pauseVideo();
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
            console.log(++this.counter);
        }
        console.log(++this.counter);
        /*doc.getElementById("play-button").click();*/
    }
    onYoutubeLoaded()  {
        let iframe = document.getElementById('youtube');
        let doc = (<HTMLIFrameElement>iframe).contentDocument;
        let a = (<HTMLLinkElement>doc.getElementsByClassName('ytp-title-link')[0]);
        this.trackName = a.getElementsByTagName("span")[1].textContent;
    }
    audioloaded()
    {
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        //this.trackName = audio.audioTracks.length.toString();//[0].label + " " + audio.audioTracks[0].kind;

        //audio.load();
        audio.play();
        //this.trackName = audio.audioTracks.toString();//[0].label + " " + audio.audioTracks[0].kind;
    }

    onYoutubeEnded()
    {
        this.selectedTrack = this.tracklist[3];
        /*if(this.selectedTrack.type == 1)
        {
            this.selectedTrack.address += "&autoplay=1";
        }*/
    }
    onAudioEnded()
    {
        this.selectedTrack = this.tracklist[3];
        /*if(this.selectedTrack.type == 1)
        {
            this.selectedTrack.address += "&autoplay=1";
        }*/
    }
}