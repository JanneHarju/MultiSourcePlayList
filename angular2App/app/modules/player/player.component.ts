import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Track } from '../../models/track';
import { TrackService } from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { SpotifyService } from '../../services/spotify.service';
import { Location }                 from '@angular/common';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

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
    playing: boolean;
    subscriptionPlaying: Subscription;
    subscriptionTrack: Subscription;
    progress: number;
    duration: number;
    ngOnInit(): void 
    {
        this.duration = 120*1000;
        this.progress = 30*1000;
        this.spotifyService.login().then(token => {
                console.log(token);
            });
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => 
        {
            this.track = track;
            if(this.track)
                this.play(this.track.address);
        });
        this.subscriptionTrack = this.spotifyService.getPlaying().subscribe(playing =>
        {
            this.playing = playing;
        });
    } 

    ngOnDestroy(): void
    {
        this.player.pauseVideo();
        this.subscriptionTrack.unsubscribe();
    }

    constructor(
        private infoService: TrackService,
        private playerService: PlayerService,
        private spotifyService: SpotifyService,
        private router: Router,
        private location: Location,
        private route: ActivatedRoute) { }

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
    }
    pause()
    {
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
    }
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
        this.playerService.chooseNextTrack();
    }
    playSpotify(trackUri?: string)
    {
        this.spotifyService.play(trackUri).subscribe(result =>
        {
            console.log(result);
        });
    }
    pauseSpotify()
    {
        this.spotifyService.pause().subscribe(result =>
        {
            console.log(result);
        });
    }
    changeprogress()
    {
        console.log("progress");
    }
}


