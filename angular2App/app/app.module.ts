import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { Configuration } from './app.constants';
import { AppRoutingModule } from './app-routing.module';

import { TrackComponent }     from './modules/track/track.component';
import { PlaylistComponent } from './modules/playlist/playlist.component';
import { TrackService }         from './services/track.service';
import { PlaylistService } from './services/playlist.service';
import { AppComponent }  from './app.component';
import { SimpleTimer } from 'ng2-simple-timer';
import { PopupComponent} from './modules/shared/popup/popup.component';
import './rxjs-extensions';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    TrackComponent,
    PlaylistComponent,
    PopupComponent,
  ],
  providers: [
    TrackService,
    PlaylistService,
    SimpleTimer,
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
