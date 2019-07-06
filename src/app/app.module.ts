import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { ServiceWorkerModule } from '@angular/service-worker';

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
import { CallbackComponent } from './modules/callback/callback.component';
import { SpotifyPlaybackSdkService } from './services/spotify-playback-sdk.service';
import { SharedModule } from './modules/shared/shared.module';

@NgModule({
  declarations: [AppComponent, LoginComponent, CallbackComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DndModule.forRoot(),
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ServiceWorkerModule, // .register('/ngsw-worker.js', {enabled: environment.production})
    SharedModule
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
        redirectPopupUri: `${window.location.origin}/callback.html`,
        redirectUri: `${window.location.origin}/callback`,
        scope: [
          'user-read-private',
          'user-modify-playback-state',
          'user-read-playback-state',
          'streaming',
          'user-read-birthdate',
          'user-read-email'
        ],
        // If you already have an authToken
        authToken: localStorage.getItem('spotify-access-token')
      }
    },
    YoutubeAPIService,
    MusixMatchAPIService,
    SimpleTimer,
    SpotifyPlaybackSdkService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
