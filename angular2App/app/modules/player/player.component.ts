import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Track } from '../../models/track';
import { TrackService } from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { SpotifyService } from '../../services/spotify.service';
import { Location }                 from '@angular/common';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { SimpleTimer } from 'ng2-simple-timer';
import { SpotifyPlayStatus } from '../../models/spotifyPlayStatus';

@Component({
    selector: 'my-player',
    templateUrl: 'player.component.html',
    styles: [ require('./player.component.less') ],
})
export class PlayerComponent implements OnInit, OnDestroy {
    //viewList: boolean = false;
    timerId: string;
    track = new Track();
    player: YT.Player;
    notFirstTime: boolean = false;
    random: number = 0;
    playStatus: SpotifyPlayStatus = new SpotifyPlayStatus();
    subscriptionPlayStatus: Subscription;
    subscriptionTrack: Subscription;
    subscriptionAuthenticationComplited : Subscription;
    progress: number;
    duration: number;
    disableProgressUpdate: boolean = false;
    isplaying: boolean = false;
    ngOnInit(): void 
    {
        //this.setProgress(0);
        //this.duration = 0;
        
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => 
        {
            this.track = track;
            if(this.track)
                this.play(this.track.address);
        });

        this.subscriptionAuthenticationComplited = this.spotifyService.getAuthenticationComplited().subscribe(auth => 
        {
            if(auth)
            {
                this.spotifyService.checkPlayerState().subscribe(status =>
                {
                    console.log("rekisteröity")
                    if(status.is_playing)
                    {
                        console.log("rekisteröity")
                        this.spotifyService.startTimer();
                    }
                });
            }
        });
        this.subscriptionPlayStatus = this.spotifyService.getPlayStatus().subscribe(playStatus =>
        {
            this.playStatus = playStatus;
            //console.log("Progress "+this.playStatus.progress_ms + "duration: "+ this.playStatus.item.duration_ms);
            this.setProgress(this.playStatus.progress_ms);
            if(this.playStatus.item)
                this.duration = this.playStatus.item.duration_ms;
        });
    } 
    setProgress(newprogress: number)
    {
        if(!this.disableProgressUpdate)
        {
            this.progress = newprogress;
        }
    }
    ngOnDestroy(): void
    {
        this.player.pauseVideo();
        this.subscriptionTrack.unsubscribe();
        this.subscriptionPlayStatus.unsubscribe();
    }

    constructor(
        private infoService: TrackService,
        private playerService: PlayerService,
        private spotifyService: SpotifyService,
        private router: Router,
        private location: Location,
        private route: ActivatedRoute,
        private st: SimpleTimer) { }

    /*getInfo(): void {
        let urlParts = this.router.url.split("/");
        let parameter = urlParts[urlParts.length-1];
        this.infoService.getTrack(+parameter)
            .then((track :Track)=> this.track = track);
    }*/
    savePlayer (player: YT.Player) {
        this.player = player;
        //console.log('player instance', player)
        }
    onStateChange(event : YT.EventArgs){
        //console.log('player state', event.data);
        if(event.data == 0)
        {
            this.playerService.chooseNextTrack();
        }
        else
        {
            let data = this.player.getVideoData()
            this.duration = this.player.getDuration()*1000;
            //this.setProgress(this.player.getCurrentTime());
            //this.trackName = data.title;
        }
    }
    
    next()
    {
        //call service here
        //this.chooseNextTrack();
        this.playerService.chooseNextTrack();
    }
    previous()
    {
        //call here service to select previous track
        //Every time track is changed start playing it
        //this.play();
        this.playerService.choosePreviousTrack();
    }
    
    play(trackUri?: string)
    {
        this.isplaying = true;
        this.disableProgressUpdate = true;
        if(this.track != null)
        {
            switch (this.track.type) {
                case 1://youtube
                    this.pauseSpotify();
                    if(this.player)
                    {
                        if(trackUri)
                        {
                            this.player.loadVideoById(trackUri);
                        }
                        this.player.playVideo();
                    }
                    break;
                case 2://spotify
                    
                    this.player.pauseVideo();
                    /*let iframe = document.getElementById('spotify');
                    let doc = (<HTMLIFrameElement>iframe).contentDocument 
                    let playbutton = doc.getElementById("play-button");
                    playbutton.click();*/
                    this.playSpotify(trackUri);
                    break;
                case 3://mp3

                    this.player.pauseVideo();
                    this.pauseSpotify();
                    let audio = (<HTMLAudioElement>document.getElementById("audio1"));
                    if(audio)
                    {
                        audio.play();
                    }
                    break;
                default:
                    break;
            }
        
        }
        
        this.st.delTimer('1sec');
        this.st.newTimer('1sec', 1);
        this.timerId = this.st.subscribe('1sec', e => this.callback());
        
        this.disableProgressUpdate = false;
    }
    pause()
    {
        this.isplaying = false;
        if(this.track != null)
        {
            switch (this.track.type) {
                case 1://youtube
                    
                    this.player.pauseVideo();
                    break;
                case 2://spotify
                    
                    /*let iframe = document.getElementById('spotify');
                    let doc = (<HTMLIFrameElement>iframe).contentDocument 
                    let playbutton = doc.getElementById("play-button");
                    playbutton.click();*/
                    this.pauseSpotify();
                    break;
                case 3://mp3
                    
                    let audio = (<HTMLAudioElement>document.getElementById("audio1"));
                    if(audio)
                        audio.pause();
                    break;
                default:
                    break;
            }
        
        }
        this.st.delTimer('1sec');
    }
    audioloaded()
    {
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        //this.trackName = audio.audioTracks.length.toString();//[0].label + " " + audio.audioTracks[0].kind;
        //audio.load();
        
        this.duration = audio.duration*1000;
        audio.play();
        //this.trackName = audio.audioTracks.toString();//[0].label + " " + audio.audioTracks[0].kind;
    }
    /*loadedmeadata()
    {
        
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        
        console.log("tänne toisaalle"+ audio.duration);
        
        this.duration = audio.duration;
    }*/
    onAudioEnded()
    {
        //Call service here to choose next track
        this.playerService.chooseNextTrack();
    }
    playSpotify(trackUri?: string)
    {
        this.spotifyService.play(trackUri).subscribe(result =>
        {
            //console.log(result);
        });
    }
    pauseSpotify()
    {
        this.spotifyService.pause().subscribe(result =>
        {
            //console.log(result);
        });
    }
    changeprogress()
    {
        if(this.track.type == 1)//youtube
        {
            this.player.seekTo(this.progress/1000, true);
        }
        else if(this.track.type == 2)//spotify
        {
            this.spotifyService.seek({position_ms: this.progress}).subscribe(res =>
            {
                //Onnistui
            });
        }
        else if(this.track.type == 3)//mp3
        {
            let audio = (<HTMLAudioElement>document.getElementById("audio1"));
            audio.currentTime = this.progress/1000;
        }
        
        this.disableProgressUpdate = false;
    }
    callback()
    {
        if(this.track.type == 1)
        {
            this.setProgress(this.player.getCurrentTime()*1000);
        }
        else if(this.track.type == 3)
        {
            let audio = (<HTMLAudioElement>document.getElementById("audio1"));
            this.setProgress(audio.currentTime * 1000);
        }
        //this.progress+=1000;
    }
    
    mouseDown()
    {
        this.disableProgressUpdate = true;
    }
}


