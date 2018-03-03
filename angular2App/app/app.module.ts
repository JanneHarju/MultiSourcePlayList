import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Configuration } from './app.constants';
import { AppRoutingModule } from './app-routing.module';
import { YoutubePlayerModule } from 'ng2-youtube-player';
import { DndModule } from 'ng2-dnd';
import { NgUploaderModule } from 'ngx-uploader';

import { LoginComponent } from './modules/login/login.component';
//import { MainModule } from 'modules/main/main.module';

import { TrackService }         from './services/track.service';
import { PlaylistService } from './services/playlist.service';
import { SpotifyService } from './services/spotify.service';
import { YoutubeAPIService } from './services/youtubeapi.service';
import { MusixMatchAPIService } from './services/musixmatch.service';
import { PlayerService } from './services/player.service';
import { BandcampService } from './services/bandcamp.service';
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';
import { AppComponent }  from './app.component';
import { SimpleTimer } from 'ng2-simple-timer';
import './rxjs-extensions';

@NgModule({
  imports: [
    BrowserModule,
    DndModule.forRoot(),
    FormsModule,
    HttpModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  providers: [
    TrackService,
    PlaylistService,
    PlayerService,
    AuthService,
    LoadingService,
    BandcampService,
    SpotifyService,
    {
        provide: 'SpotifyConfig',
        useValue: {
            clientId: '5ab10cb4fa9045fca2b92fcd0a97545c',
            redirectUri: 'http://musiple.azurewebsites.net/callback.html',
            //redirectUri: 'http://localhost:8080/callback.html',
            scope: ['user-read-private',
            'user-modify-playback-state',
            'user-read-playback-state'],
            // If you already have an authToken
            authToken: localStorage.getItem('spotify-access-token')
        }
    },
    YoutubeAPIService,
    MusixMatchAPIService,
    SimpleTimer
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
