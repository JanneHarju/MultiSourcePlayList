import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PlaylistService} from '../../services/playlist.service';
import { SpotifyService } from '../../services/spotify.service';
import { Playlist } from '../../models/playlist'
import { SpotifyPlaylist } from '../../models/spotifyplaylist';
import { SpotifyUser } from '../../models/spotifyUser';

@Component({
    selector: 'my-playlist',
    templateUrl: 'playlist.component.html',
    styles: [ require('./playlist.component.less') ]
})

export class PlaylistComponent implements OnInit {
    constructor(
        private playlistService: PlaylistService,
        private spotifyService: SpotifyService,
        private router: Router) { }
    playlists: Playlist[] = [];
    spotifyplaylists: SpotifyPlaylist[] = [];
    currentSpotifyUser: SpotifyUser = new SpotifyUser();
    loginToSpotify()
    {
        this.spotifyService.login().then(token => {
                console.log(token);

                //this.spotifyService.getCurrentUser()
                //    .subscribe(data=> { console.log("getCurrentUser: ", data); this.user = data },
                //    err=> console.error(err));

            });//,
            //err => console.error(err),
            //() => { });
    }
    
    ngOnInit() 
    { 
        this.getPlaylists();
    }
    getPlaylists(): void {
        this.playlistService.getPlaylists()
            .then((playlists : Playlist[])=> this.playlists = playlists);
        this.spotifyService.getUsersPlaylist()
            .subscribe((playlists : SpotifyPlaylist[])=> this.spotifyplaylists = playlists);
        this.currentSpotifyUser = this.spotifyService.getUser();
    }
    add(name: string): void {
        name = name.trim();
        if (!name) { return; }
        this.playlistService.create(name)
            .then((playlist : Playlist) => {
            this.playlists.push(playlist);
            //this.selectedHero = null;
            this.getPlaylists();
            });
    }
}