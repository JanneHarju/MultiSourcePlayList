import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { Configuration } from './app.constants';
import { AppRoutingModule } from './app-routing.module';


import { YoutubePlayerModule } from 'ng2-youtube-player';
import { DndModule } from 'ng2-dnd';

import { PlaylistComponent } from './modules/playlist/playlist.component';
import { TracklistComponent } from './modules/tracklist/tracklist.component';
import { AddTrackPopupComponent } from './modules/addtrackpopup/addtrackpopup.component';
import { SafePipe} from './modules/shared/safepipe';
import { ColorPipe} from './modules/shared/colorpipe';

import { TrackService }         from './services/track.service';
import { PlaylistService } from './services/playlist.service';
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
    YoutubePlayerModule
  ],
  declarations: [
    AppComponent,
    PlaylistComponent,
    TracklistComponent,
    PopupComponent,
    AddTrackPopupComponent,
    SafePipe,
    ColorPipe
  ],
  providers: [
    TrackService,
    PlaylistService,
    SimpleTimer,
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
