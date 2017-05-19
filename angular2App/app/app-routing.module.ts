import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaylistComponent }      from './modules/playlist/playlist.component';
import { TracklistComponent } from './modules/tracklist/tracklist.component';
import { SearchlistComponent } from './modules/searchlist/searchlist.component';
import { SpotifyPlaylistComponent } from './modules/spotifyplaylist/spotifyplaylist.component';
import { AddTrackPopupComponent } from './modules/addtrackpopup/addtrackpopup.component';

import { PopupComponent} from './modules/shared/popup/popup.component';

const routes: Routes = [
  { path: '', redirectTo: '/tracklist/0', pathMatch: 'full' },
  //{ path: 'playlist',  component: PlaylistComponent },SearchlistComponent
  { path: 'tracklist/:id',  component: TracklistComponent, },
  { path: 'searchlist/:id',  component: SearchlistComponent, },
  { path: 'spotifylist/:id/:id2',  component: SpotifyPlaylistComponent, },
  { path: 'addtrackpopup', component: AddTrackPopupComponent, outlet: 'popup' }
  //{ path: 'popup', component: PopupComponent, outlet: 'popup' },
  /**children: [{
         path: 'addtrackpopup', component: AddTrackPopupComponent, outlet: 'popup'
    }]}, */
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
