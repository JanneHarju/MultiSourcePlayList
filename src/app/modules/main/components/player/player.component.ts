import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Track } from '../../../../models/track';
import { TrackService } from '../../../../services/track.service';
import { PlayerService } from '../../../../services/player.service';
import { SpotifyService } from '../../../../services/spotify.service';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SimpleTimer } from 'ng2-simple-timer';
import { SpotifyPlayStatus } from '../../../../models/spotifyPlayStatus';
import { MusixMatchAPIService } from '../../../../services/musixmatch.service';
import { MusixMatchLyric } from '../../../../models/musixmatchlyric';
import { environment } from '../../../../../environments/environment';
import { SpotifyPlaybackSdkService } from '../../../../services/spotify-playback-sdk.service';

/// <reference path="../node_modules/@types/youtube/index.d.ts"/>

@Component({
    selector: 'my-player',
    templateUrl: 'player.component.html',
    styleUrls: [ './player.component.css' ],
})
export class PlayerComponent implements OnInit, OnDestroy {
    timerId: string;
    track = new Track();
    player: YT.Player;
    notFirstTime = false;
    random = 0;
    lyric = '';
    lyricHeader = '';
    lyricImageUrl = '';
    playStatus: SpotifyPlayStatus = new SpotifyPlayStatus();
    subscriptionPlayStateFromSDK: Subscription;
    subscriptionTrack: Subscription;
    subscriptionAuthenticationComplited: Subscription;
    progress: number;
    duration: number;
    shuffle = false;
    disableProgressUpdate = false;

    private _isPlaying = false;
    get IsPlaying(): boolean {
        return this._isPlaying;
    }
    set IsPlaying(value: boolean) {
        if ('mediaSession' in navigator) {
            if (value) {
                navigator.mediaSession.playbackState = 'playing';
            } else {
                navigator.mediaSession.playbackState = 'paused';
            }
        }
        this._isPlaying = value;
    }

    audioScale = 300;
    YTScale = 4;
    volume = 50;
    lastmp3trackAddress: string;
    sameMp3AsLastTime: boolean;
    audio: HTMLAudioElement;
    constructor(
        private infoService: TrackService,
        private playerService: PlayerService,
        private spotifyService: SpotifyService,
        private spotifyPlaybackService: SpotifyPlaybackSdkService,
        private router: Router,
        private location: Location,
        private route: ActivatedRoute,
        private musixmatchService: MusixMatchAPIService,
        private st: SimpleTimer) { }

    ngOnInit(): void {
        this.setMP3Player();
        const vol = localStorage.getItem('musiple-volume');
        this.subscriptionAuthenticationComplited = this.spotifyService.getAuthenticationComplited().subscribe(auth => {
            if (auth) {
                this.spotifyPlaybackService.addSpotifyPlaybackSdk();
            }
        });
        if (vol) {
            this.volume = +vol;
        }
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => {
            if (this.track && (this.track.Type === 3 || this.track.Type === 5)) {
                this.lastmp3trackAddress = this.track.Address;
            }

            this.sameMp3AsLastTime = this.lastmp3trackAddress === track.Address;
            
            this.track = track;
            if (this.track) {
                this.play(this.track.Address);
            }
        });
        
        this.subscriptionPlayStateFromSDK = this.spotifyPlaybackService.getPlayStatus().subscribe(state => {
            if (this.track.Type === 2 && state) {
                this.setProgress(state.position);
                this.duration = state.duration;
            }
        });
        
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => this.play());
            navigator.mediaSession.setActionHandler('pause', () => this.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
        }
    }
    setProgress(newprogress: number) {
        if (!this.disableProgressUpdate) {
            this.progress = newprogress;
        }
    }
    ngOnDestroy(): void {
        this.subscriptionTrack.unsubscribe();
        this.subscriptionAuthenticationComplited.unsubscribe();
    }

    savePlayer (player: YT.Player) {
        this.player = player;
    }
    onStateChange(event: YT.OnStateChangeEvent) {
        if (event.data === 0) {
            this.playerService.chooseNextTrack();
        } else {
            this.duration = this.player.getDuration() * 1000;
        }
    }
    next() {
        if (this.track.Address) {
            this.playerService.chooseNextTrack();
        }
    }
    previous() {

        if (this.track.Address) {
            if (this.progress < 2500) {
                this.playerService.choosePreviousTrack();
            } else {
                this.progress = 0;
                this.changeprogressTo(this.progress);
            }
        }
    }

    play(trackUri?: string) {
        if (this.track.Address) {
            this.disableProgressUpdate = true;
            if (this.track != null) {
                switch (this.track.Type) {
                    case 1: // youtube
                        this.pauseSpotify();
                        this.audio.pause();
                        if (this.player) {
                            if (trackUri) {
                                this.player.loadVideoById(trackUri);
                            }
                            this.player.setVolume(this.volume / this.YTScale);
                            this.player.playVideo();
                            this.IsPlaying = true;
                        }
                        break;
                    case 2: // spotify
                        this.player.pauseVideo();
                        this.audio.pause();
                        this.spotifyService.setVolume({volume_percent: this.volume}).then(res => {
                            // Onnistui
                        });
                        this.playSpotify(trackUri);
                        break;
                    case 3: // mp3
                    case 5:

                        this.player.pauseVideo();
                        this.pauseSpotify();
                        let oldAddress = this.audio.src;
                        let address = this.localFileAddress(this.track);
                        let newaddress = address;
                        if(this.track.Type === 5) {
                            const newparts = newaddress.split('/');
                            const newtrackName = newparts[newparts.length -1].split('.mp3')[0];
                            var oldparts = oldAddress.split('/');
                            const oldtrackName = oldparts[oldparts.length -1].split('.mp3')[0];
                            newaddress = encodeURIComponent(newtrackName);
                            oldAddress = oldtrackName;
                        }
                        if (oldAddress !== newaddress) {
                            //this.setMP3Player();
                            console.log('here');
                            this.audio.src = address;
                        } else if (this.sameMp3AsLastTime) {
                            this.progress = 0;
                            this.changeprogressTo(this.progress);
                            this.sameMp3AsLastTime = false;
                        }
                        this.audio.play();
                        this.audio.volume = this.volume / this.audioScale;
                        this.IsPlaying = true;
                        break;
                    case 4: // direct address
                        this.player.pauseVideo();
                        this.pauseSpotify();
                        //this.setMP3Player();
                        this.audio.src = this.track.Address;
                        this.IsPlaying = true;
                    default:
                        break;
                }
                if ('mediaSession' in navigator) {
                    const parts = this.track.Name.split(' - ');
                    const artist = parts[0];
                    const title = parts[1];
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: title,
                        artist: artist,
                      });
                }
            }

            this.st.delTimer('1sec');
            this.st.newTimer('1sec', 1);
            this.timerId = this.st.subscribe('1sec', e => this.callback());

            this.disableProgressUpdate = false;
        }
    }
    setMP3Player() {
        this.audio = new Audio();
        this.audio.preload = 'auto';
        this.audio.controls = false;
        this.audio.onerror = () => this.error();
        this.audio.onended = () => this.onAudioEnded();
        this.audio.onloadedmetadata = () => this.loadedmeadata();
        this.audio.onloadeddata = () => this.loadeddata();
        //this.audio.oncanplaythrough = () => this.startPlay();
    }
    startPlay() {
        this.audio.play();
    }
    /*startMP3Player() {
        if(this.audio != null) {
            this.audio.load();
            this.audio.play();
            this.audio.volume = this.volume / this.audioScale;
        }
    }*/
    setVolume() {

        localStorage.setItem('musiple-volume', this.volume.toString());
        if (this.track != null) {
            if (this.track.Address) {
                switch (this.track.Type) {
                    case 1: // youtube
                        if (this.player) {
                            this.player.setVolume(this.volume / this.YTScale);
                        }
                        break;
                    case 2: // spotify
                        this.spotifyService.setVolume({volume_percent: this.volume}).then(res => {
                            // Onnistui
                        });
                        break;
                    case 3: // mp3
                    case 5:
                    case 4: // direct address
                        this.audio.volume = this.volume / this.audioScale;
                        break;
                    default:
                        break;
                }
            }
        }
    }
    pause() {
        if (this.track.Address) {
            this.IsPlaying = false;
            if (this.track != null) {
                switch (this.track.Type) {
                    case 1: // youtube
                        this.player.pauseVideo();
                        break;
                    case 2: // spotify
                        this.pauseSpotify();
                        break;
                    case 3: // mp3
                    case 5:
                    case 4: // direct address
                        this.audio.pause();
                        break;
                    default:
                        break;
                }

            }
            this.st.delTimer('1sec');
        }
    }

    lyrics() {
        if (this.track.Address) {
            this.lyricHeader = this.track.Name;
            this.lyric = '';
            this.lyricImageUrl = '';
            this.musixmatchService.search(this.track.Name)
                .subscribe(lyrics => {

                    if (lyrics) {
                        this.lyric = lyrics.lyrics_body;
                        this.lyricImageUrl = lyrics.pixel_tracking_url;
                    } else {
                        this.lyric = 'Lyrics could not be found.';
                    }
                });
        }
    }
    localFileAddress(track: Track): string {
        const filePathForAzureFile = `${environment.backendUrl}/api/audio/`;
        const filePathForAzureBlop = 'https://musiple.blob.core.windows.net/';
    
        if(track.Type === 3) {
            return filePathForAzureFile + track.Id;
        } else {
            return filePathForAzureBlop +
                localStorage.getItem('Folder') +
                '/' +
                track.Address + 
                localStorage.getItem('SASToken');
        }
    }
    loadedmeadata() {
        this.audio.volume = this.volume / this.audioScale;
        this.duration = this.audio.duration * 1000;
    }
    onAudioEnded() {
        this.playerService.chooseNextTrack();
    }
    playSpotify(trackUri?: string) {
        this.spotifyService.play(trackUri).then(result => {
            this.spotifyPlaybackService.startTimer();
            this.IsPlaying = true;
        });
    }
    pauseSpotify() {

        this.spotifyPlaybackService.removeTimer();
        this.spotifyService.pause().then(result => {

        });
    }
    changeprogress() {
        this.changeprogressTo(this.progress);
    }
    error() {
        const audio = this.audio;
        console.error(audio.error.code); // 4
        // console.error(audio.error.msExtendedCode);//undefined
        // console.error(audio.error.MEDIA_ERR_ABORTED);//1
        // console.error(audio.error.MEDIA_ERR_DECODE);//3
        // console.error(audio.error.MEDIA_ERR_NETWORK);//2
        // console.error(audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED);//4
        // console.error(audio.error.MS_MEDIA_ERR_ENCRYPTED);//undefined
        alert('Some error occured when streaming mp3 file. Error code: ' + audio.error.code);
    }
    loadeddata() {
        const audio = this.audio;
        if (audio && audio.readyState >= 2) {
            audio.play();
        }
    }
    changeprogressTo(seek: number) {
        if (this.track.Type === 1) {
            this.player.seekTo(seek / 1000, true);
        } else if (this.track.Type === 2) {
            this.spotifyService.seek({position_ms: seek}).then(res => {
                // Onnistui
            });
        } else if (this.track.Type === 3 || this.track.Type === 4 || this.track.Type === 5) {
            this.audio.currentTime = seek / 1000;
        }

        this.disableProgressUpdate = false;
    }
    shuffleChanged() {
        this.playerService.shuffle = !this.shuffle;
    }
    callback() {
        if (this.track.Type === 1) {
            this.setProgress(this.player.getCurrentTime() * 1000);
        } else if (this.track.Type === 3 || this.track.Type === 4 || this.track.Type === 5) {
            this.setProgress(this.audio.currentTime * 1000);
        }
    }

    mouseDown() {
        this.disableProgressUpdate = true;
    }
}


