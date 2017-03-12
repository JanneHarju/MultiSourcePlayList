import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerComponent }      from './modules/player/player.component';
import { PlaylistComponent }      from './modules/playlist/playlist.component';
import { TracklistComponent } from './modules/tracklist/tracklist.component';

import { PopupComponent} from './modules/shared/popup/popup.component';

const routes: Routes = [
  { path: '', redirectTo: '/playlist', pathMatch: 'full' },
  { path: 'playlist',  component: PlaylistComponent },
  { path: 'tracklist/:id',  component: TracklistComponent },
  { path: 'popup', component: PopupComponent, outlet: 'popup' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
