import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { ServiceWorkerModule } from '@angular/service-worker';


import { YoutubePlayerModule } from 'ng2-youtube-player';
import { DndModule } from 'ng2-dnd';
import { NgUploaderModule } from 'ngx-uploader';

import { LoginComponent } from './modules/login/login.component';

import { TrackService } from './services/track.service';
import { PlaylistService } from './services/playlist.service';
import { SpotifyService } from './services/spotify.service';
import { YoutubeAPIService } from './services/youtubeapi.service';
import { MusixMatchAPIService } from './services/musixmatch.service';
import { PlayerService } from './services/player.service';
import { BandcampService } from './services/bandcamp.service';
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';
import { SimpleTimer } from 'ng2-simple-timer';
import './rxjs-extensions';

import { AppComponent } from './app.component';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DndModule.forRoot(),
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ServiceWorkerModule// .register('/ngsw-worker.js', {enabled: environment.production})
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
            // redirectUri: 'http://localhost:4200/callback.html',
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
  bootstrap: [AppComponent]
})
export class AppModule { }
