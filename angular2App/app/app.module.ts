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

import { PlayerComponent } from './modules/player/player.component';
import { PlaylistComponent } from './modules/playlist/playlist.component';
import { TracklistComponent } from './modules/tracklist/tracklist.component';
import { SearchComponent } from './modules/search/search.component';
import { SearchlistComponent } from './modules/searchlist/searchlist.component';
import { SpotifyPlaylistComponent } from './modules/spotifyplaylist/spotifyplaylist.component';
import { SpotifyAlbumComponent } from './modules/spotifyAlbum/spotifyalbum.component';
import { SpotifyArtistComponent } from './modules/spotifyartist/spotifyartist.component';
import { FileUploadComponent } from './modules/fileupload/fileupload.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { LoginComponent } from './modules/login/login.component';
import { UserInfoComponent } from './modules/userinfo/userInfo.component';
import { QueueComponent } from './modules/queue/queue.component';
import { MainComponent} from './modules/main/main.component';
import { ModalComponent} from './modules/modal/modal.component';
import { SafePipe} from './modules/shared/safepipe';
import { SafeValuePipe} from './modules/shared/safevaluepipe';
import { ColorPipe} from './modules/shared/colorpipe';
import { DisplayTimePipe} from './modules/shared/displaytimepipe';

import { TrackService }         from './services/track.service';
import { PlaylistService } from './services/playlist.service';
import { SpotifyService } from './services/spotify.service';
import { YoutubeAPIService } from './services/youtubeapi.service';
import { MusixMatchAPIService } from './services/musixmatch.service';
import { PlayerService } from './services/player.service';
import { BandcampService } from './services/bandcamp.service';
import { AuthService } from "./services/auth.service";
import { LoadingService } from "./services/loading.service";
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
    YoutubePlayerModule,
    NgUploaderModule,
    BrowserAnimationsModule
  ],
  declarations: [
    AppComponent,
    MainComponent,
    PlayerComponent,
    PlaylistComponent,
    TracklistComponent,
    SearchComponent,
    SearchlistComponent,
    SpotifyPlaylistComponent,
    SpotifyAlbumComponent,
    SpotifyArtistComponent,
    NavbarComponent,
    LoginComponent,
    FileUploadComponent,
    UserInfoComponent,
    QueueComponent,
    ModalComponent,
    SafePipe,
    SafeValuePipe,
    ColorPipe,
    DisplayTimePipe
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
        provide: "SpotifyConfig",
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
