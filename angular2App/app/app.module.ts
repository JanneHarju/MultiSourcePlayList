import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { Configuration } from './app.constants';
import { AppRoutingModule } from './app-routing.module';


import { YoutubePlayerModule } from 'ng2-youtube-player';
import { DndModule } from 'ng2-dnd';

import { NgUploaderModule } from 'ngx-uploader';
import { ModalModule } from "ng2-modal";

import { PlayerComponent } from './modules/player/player.component';
import { PlaylistComponent } from './modules/playlist/playlist.component';
import { TracklistComponent } from './modules/tracklist/tracklist.component';
import { SearchComponent } from './modules/search/search.component';
import { SearchlistComponent } from './modules/searchlist/searchlist.component';
import { SpotifyPlaylistComponent } from './modules/spotifyplaylist/spotifyplaylist.component';
import { SpotifyAlbumComponent } from './modules/spotifyAlbum/spotifyalbum.component';
import { SpotifyArtistComponent } from './modules/spotifyartist/spotifyartist.component';
import { FileUploadComponent } from './modules/fileupload/fileupload.component';
import { AddTrackPopupComponent } from './modules/addtrackpopup/addtrackpopup.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { LoginComponent } from './modules/login/login.component';
import { MainComponent} from './modules/main/main.component';
import { SafePipe} from './modules/shared/safepipe';
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
import { AppComponent }  from './app.component';
import { SimpleTimer } from 'ng2-simple-timer';
import { PopupComponent} from './modules/shared/popup/popup.component';
import './rxjs-extensions';

@NgModule({
  imports: [
    BrowserModule,
    DndModule.forRoot(),
    FormsModule,
    HttpModule,
    AppRoutingModule,
    YoutubePlayerModule,
    ModalModule,
    NgUploaderModule
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
    PopupComponent,
    AddTrackPopupComponent,
    NavbarComponent,
    LoginComponent,
    FileUploadComponent,
    SafePipe,
    ColorPipe,
    DisplayTimePipe
  ],
  providers: [
    TrackService,
    PlaylistService,
    PlayerService,
    AuthService,
    BandcampService,
    SpotifyService,
    {
        provide: "SpotifyConfig",
        useValue: {
            clientId: '5ab10cb4fa9045fca2b92fcd0a97545c',
            redirectUri: 'http://localhost:5000/callback.html',
            scope: ['user-read-private',
            'user-modify-playback-state'],
            // If you already have an authToken
            authToken: localStorage.getItem('spotify-token')
        }
    },
    YoutubeAPIService,
    MusixMatchAPIService,
    SimpleTimer
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
