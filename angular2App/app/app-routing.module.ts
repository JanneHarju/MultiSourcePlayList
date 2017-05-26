import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaylistComponent }      from './modules/playlist/playlist.component';
import { TracklistComponent } from './modules/tracklist/tracklist.component';
import { SearchlistComponent } from './modules/searchlist/searchlist.component';
import { SpotifyPlaylistComponent } from './modules/spotifyplaylist/spotifyplaylist.component';
import { AddTrackPopupComponent } from './modules/addtrackpopup/addtrackpopup.component';
import { LoginComponent } from './modules/login/login.component';
import { AuthService} from './services/auth.service';

import { PopupComponent} from './modules/shared/popup/popup.component';

const routes: Routes = [
    { path: "", redirectTo: "login", pathMatch: "full" },
    //{ path: 'playlist',  component: PlaylistComponent },SearchlistComponent
    { path: 'login',  component: LoginComponent },
    { path: 'tracklist/:id',  component: TracklistComponent, canActivate: [ AuthService]},
    { path: 'searchlist/:id',  component: SearchlistComponent, canActivate: [ AuthService] },
    { path: 'spotifylist/:id/:id2',  component: SpotifyPlaylistComponent, canActivate: [ AuthService] }
    //{ path: 'addtrackpopup', component: AddTrackPopupComponent, outlet: 'popup' }
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
