import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PlaylistService} from '../../services/playlist.service';
import { SpotifyService } from '../../services/spotify.service';
import { Playlist } from '../../models/playlist'

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
    
    play(): void {
        //3d9DChrdc6BOeFsbrZ3Is0, spotify:track:5IyL3XOaRPpTgxVjRIAxXU Ziggy stardust
        this.spotifyService.play("spotify:track:3d9DChrdc6BOeFsbrZ3Is0").subscribe(result =>
        {
            console.log(result);
        });
    }
    ngOnInit() 
    { 
        this.getPlaylists();
    }
    getPlaylists(): void {
        this.playlistService.getPlaylists()
            .then((playlists : Playlist[])=> this.playlists = playlists);
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