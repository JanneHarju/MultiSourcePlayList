import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MainRoutingModule } from './main-routing.module';

import { YoutubePlayerModule } from 'ng2-youtube-player';
import { DndModule } from 'ng2-dnd';

import { NgUploaderModule } from 'ngx-uploader';

import { PlayerComponent } from './components/player/player.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { TracklistComponent } from './components/tracklist/tracklist.component';
import { SearchComponent } from './components/search/search.component';
import { SearchlistComponent } from './components/searchlist/searchlist.component';
import { SpotifyPlaylistComponent } from './components/spotifyplaylist/spotifyplaylist.component';
import { SpotifyAlbumComponent } from './components/spotifyAlbum/spotifyalbum.component';
import { SpotifyArtistComponent } from './components/spotifyartist/spotifyartist.component';
import { BandcampAlbumComponent } from './components/bandcampalbum/bandcampalbum.component';
import { BandcampArtistComponent } from './components/bandcampartist/bandcampartist.component';
import { FileUploadComponent } from './components/fileupload/fileupload.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UserInfoComponent } from './components/userinfo/userInfo.component';
import { QueueComponent } from './components/queue/queue.component';
import { MainComponent} from './components/main/main.component';
import { ModalComponent} from './components/modal/modal.component';
import { SafePipe} from './components/shared/safepipe';
import { SafeValuePipe} from './components/shared/safevaluepipe';
import { ColorPipe} from './components/shared/colorpipe';
import { DisplayTimePipe} from './components/shared/displaytimepipe';
import { BandcampDurationPipe } from './components/shared/bandcampDurationPipe';

import { SimpleTimer } from 'ng2-simple-timer';
import '../../rxjs-extensions';

@NgModule({
  imports: [
    DndModule.forRoot(),
    CommonModule,
    FormsModule,
    MainRoutingModule,
    YoutubePlayerModule,
    NgUploaderModule,
  ],
  declarations: [
    MainComponent,
    PlayerComponent,
    PlaylistComponent,
    TracklistComponent,
    SearchComponent,
    SearchlistComponent,
    SpotifyPlaylistComponent,
    SpotifyAlbumComponent,
    SpotifyArtistComponent,
    BandcampAlbumComponent,
    BandcampArtistComponent,
    NavbarComponent,
    FileUploadComponent,
    UserInfoComponent,
    QueueComponent,
    ModalComponent,
    SafePipe,
    SafeValuePipe,
    ColorPipe,
    DisplayTimePipe,
    BandcampDurationPipe
  ],
  providers: [
    SimpleTimer
  ],
})
export class MainModule { }
