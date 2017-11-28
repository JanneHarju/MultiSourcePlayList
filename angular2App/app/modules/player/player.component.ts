import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Track } from '../../models/track';
import { TrackService } from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { SpotifyService } from '../../services/spotify.service';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { SimpleTimer } from 'ng2-simple-timer';
import { SpotifyPlayStatus } from '../../models/spotifyPlayStatus';
import { MusixMatchAPIService } from '../../services/musixmatch.service';
import { MusixMatchLyric } from '../../models/musixmatchlyric';
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'my-player',
    templateUrl: 'player.component.html',
    styleUrls: [ './player.component.css' ],
})
export class PlayerComponent implements OnInit, OnDestroy {
    //viewList: boolean = false;
    timerId: string;
    track = new Track();
    player: YT.Player;
    notFirstTime: boolean = false;
    random: number = 0;
    lyric: string = "";
    lyricHeader: string = "";
    lyricImageUrl: string = "";
    playStatus: SpotifyPlayStatus = new SpotifyPlayStatus();
    subscriptionPlayStatus: Subscription;
    subscriptionTrack: Subscription;
    subscriptionAuthenticationComplited : Subscription;
    progress: number;
    duration: number;
    shuffle: boolean = false;
    disableProgressUpdate: boolean = false;
    isplaying: boolean = false;
    audioScale: number = 300;
    YTScale: number = 4;
    localFilePath: string = "api/audio/";
    volume: number = 50;
    constructor(
        private infoService: TrackService,
        private playerService: PlayerService,
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private router: Router,
        private location: Location,
        private route: ActivatedRoute,
        private musixmatchService: MusixMatchAPIService,
        private st: SimpleTimer) { }
    
    ngOnInit(): void 
    {
        //this.setProgress(0);
        //this.duration = 0;
        let vol = localStorage.getItem('musiple-volume');
        if(vol)
        {
            this.volume = +vol;
        }
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => 
        {
            this.track = track;
            if(this.track)
                this.play(this.track.Address);
        });

        /*this.subscriptionAuthenticationComplited = this.spotifyService.getAuthenticationComplited().subscribe(auth => 
        {
            if(auth)
            {
                this.spotifyService.checkPlayerState().then(status =>
                {
                    if(status.is_playing)
                    {
                        //Tämä ei riitä pitää hakea myös kappaleen tiedot yms.
                        //entä soittolista?
                        this.spotifyService.startTimer();
                    }
                });
            }
        });*/
        this.subscriptionPlayStatus = this.spotifyService.getPlayStatus().subscribe(playStatus =>
        {
            this.playStatus = playStatus;
            if(this.track.Type == 2)
            {
                this.setProgress(this.playStatus.progress_ms);
                if(this.playStatus.item)
                    this.duration = this.playStatus.item.duration_ms;
            }
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
        this.subscriptionTrack.unsubscribe();
        this.subscriptionPlayStatus.unsubscribe();
    }

    savePlayer (player: YT.Player) {
        this.player = player;
        }
    onStateChange(event : YT.EventArgs){
        if(event.data == 0)
        {
            this.playerService.chooseNextTrack();
        }
        else
        {
            let data = this.player.getVideoData()
            this.duration = this.player.getDuration()*1000;
        }
    }
    
    next()
    {
        if(this.track.Address)
        {
            this.playerService.chooseNextTrack();
        }
    }
    previous()
    {

        if(this.track.Address)
        {
            if(this.progress < 2500)
            {
                this.playerService.choosePreviousTrack();
            }
            else
            {
                this.progress = 0;
                this.changeprogressTo(this.progress);
            }
        }
    }
    
    play(trackUri?: string)
    {

        if(this.track.Address)
        {
            this.disableProgressUpdate = true;
            if(this.track != null)
            {
                switch (this.track.Type) {
                    case 1://youtube
                        this.pauseSpotify();
                        if(this.player)
                        {
                            if(trackUri)
                            {
                                this.player.loadVideoById(trackUri);
                            }
                            this.player.setVolume(this.volume/this.YTScale);
                            this.player.playVideo();
                            this.isplaying = true;
                        }
                        break;
                    case 2://spotify
                        this.player.pauseVideo();
                        /*let iframe = document.getElementById('spotify');
                        let doc = (<HTMLIFrameElement>iframe).contentDocument 
                        let playbutton = doc.getElementById("play-button");
                        playbutton.click();*/
                        this.spotifyService.setVolume({volume_percent: this.volume}).then(res =>
                        {
                            //Onnistui
                        });
                        this.playSpotify(trackUri);
                        break;
                    case 3://mp3

                        this.player.pauseVideo();
                        this.pauseSpotify();
                        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
                        if(audio)
                        {
                            audio.play();
                            audio.volume = this.volume/this.audioScale;
                        }
                        this.isplaying = true;
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
    }
    setVolume()
    {
        
        localStorage.setItem('musiple-volume', this.volume.toString());
        if(this.track != null)
        {
            if(this.track.Address)
            {
                switch (this.track.Type) {
                    case 1://youtube
                        if(this.player)
                        {
                            
                            this.player.setVolume(this.volume/this.YTScale);
                        }
                        break;
                    case 2://spotify
                        this.spotifyService.setVolume({volume_percent: this.volume}).then(res =>
                        {
                            //Onnistui
                        });
                        break;
                    case 3://mp3
                        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
                        if(audio)
                        {
                            audio.volume = this.volume/this.audioScale;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
    pause()
    {
        if(this.track.Address)
        {
            this.isplaying = false;
            if(this.track != null)
            {
                switch (this.track.Type) {
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
    }
    /*audioloaded()
    {
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        //this.trackName = audio.audioTracks.length.toString();//[0].label + " " + audio.audioTracks[0].kind;
        //audio.load();
        
        this.duration = audio.duration*1000;
        //audio.audioTracks[0].label;
        audio.play();
        //this.trackName = audio.audioTracks.toString();//[0].label + " " + audio.audioTracks[0].kind;
    }*/
    lyrics()
    {
        if(this.track.Address)
        {
            this.lyricHeader = this.track.Name;
            this.lyric = "";
            this.lyricImageUrl = "";
            this.musixmatchService.search(this.track.Name)
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
    }
    localFileAddress(track: Track) : string
    {
        let token = this.authService.getLocalToken();
        return this.localFilePath + track.Id + "?access_token="+token;
    }
    loadedmeadata()
    {
        
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        audio.volume = this.volume/this.audioScale;
        
        this.duration = audio.duration*1000;
    }
    onAudioEnded()
    {
        //Call service here to choose next track
        this.playerService.chooseNextTrack();
    }
    playSpotify(trackUri?: string)
    {
        this.spotifyService.play(trackUri).then(result =>
        {

            this.isplaying = true;
        });
    }
    pauseSpotify()
    {
        this.spotifyService.pause().then(result =>
        {

        });
    }
    changeprogress()
    {
        this.changeprogressTo(this.progress);
    }
    error()
    {
        let audio = (<HTMLAudioElement>document.getElementById("audio1"));
        console.error(audio.error.code);//4
        //console.error(audio.error.msExtendedCode);//undefined
        //console.error(audio.error.MEDIA_ERR_ABORTED);//1
        //console.error(audio.error.MEDIA_ERR_DECODE);//3
        //console.error(audio.error.MEDIA_ERR_NETWORK);//2
        //console.error(audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED);//4
        //console.error(audio.error.MS_MEDIA_ERR_ENCRYPTED);//undefined
        alert("Some error occured when streaming mp3 file.");
    }
    changeprogressTo(seek: number)
    {
        if(this.track.Type == 1)//youtube
        {
            this.player.seekTo(seek/1000, true);
        }
        else if(this.track.Type == 2)//spotify
        {
            this.spotifyService.seek({position_ms: seek}).then(res =>
            {
                //Onnistui
            });
        }
        else if(this.track.Type == 3)//mp3
        {
            let audio = (<HTMLAudioElement>document.getElementById("audio1"));
            audio.currentTime = seek/1000;
        }
        
        this.disableProgressUpdate = false;
    }
    shuffleChanged()
    {
        this.playerService.shuffle = !this.shuffle;
    }
    callback()
    {
        if(this.track.Type == 1)
        {
            this.setProgress(this.player.getCurrentTime()*1000);
        }
        else if(this.track.Type == 3)
        {
            let audio = (<HTMLAudioElement>document.getElementById("audio1"));
            if(audio)
                this.setProgress(audio.currentTime * 1000);
        }
        //this.progress+=1000;
    }
    
    mouseDown()
    {
        this.disableProgressUpdate = true;
    }
}


