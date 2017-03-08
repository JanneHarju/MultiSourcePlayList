import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackComponent }      from './modules/track/track.component';
import { PopupComponent} from './modules/shared/popup/popup.component';

const routes: Routes = [
  { path: '', redirectTo: '/track/0', pathMatch: 'full' },
  { path: 'track/:id',  component: TrackComponent },
  { path: 'popup', component: PopupComponent, outlet: 'popup' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
