import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaylistComponent }      from './components/playlist/playlist.component';
import { TracklistComponent } from './components/tracklist/tracklist.component';
import { SearchlistComponent } from './components/searchlist/searchlist.component';
import { MainComponent } from './components/main/main.component';
import { SpotifyPlaylistComponent } from './components/spotifyplaylist/spotifyplaylist.component';
import { SpotifyAlbumComponent } from './components/spotifyAlbum/spotifyalbum.component';
import { SpotifyArtistComponent } from './components/spotifyartist/spotifyartist.component';
import { BandcampAlbumComponent } from './components/bandcampalbum/bandcampalbum.component';
import { BandcampArtistComponent } from './components/bandcampartist/bandcampartist.component';
import { UserInfoComponent } from './components/userinfo/userInfo.component';
import { QueueComponent } from './components/queue/queue.component';

const routes: Routes = [
    { path: '',  component: MainComponent,
    children: [
        { path: 'tracklist/:id',  component: TracklistComponent},
        { path: 'searchlist/:id',  component: SearchlistComponent},
        { path: 'spotifylist/:id/:id2',  component: SpotifyPlaylistComponent },
        { path: 'spotifyalbum/:id',  component: SpotifyAlbumComponent },
        { path: 'spotifyartist/:id',  component: SpotifyArtistComponent },
        { path: 'bandcampalbum/:id',  component: BandcampAlbumComponent },
        { path: 'bandcampartist/:id/:id2/:id3',  component: BandcampArtistComponent },
        { path: 'userinfo',  component: UserInfoComponent },
        { path: 'queue',  component: QueueComponent }
    ]},
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class MainRoutingModule {}
