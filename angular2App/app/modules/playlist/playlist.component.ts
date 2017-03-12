import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PlaylistService} from '../../services/playlist.service';
import { Playlist } from '../../models/playlist'

@Component({
    selector: 'my-playlist',
    templateUrl: 'playlist.component.html',
    styles: [ require('./playlist.component.less') ]
})

export class PlaylistComponent implements OnInit {
    constructor(
        private playlistService: PlaylistService,
        private router: Router) { }
    playlists: Playlist[] = [];
    ngOnInit() 
    { 
        this.getPlaylists();
    }
    getPlaylists(): void {
        this.playlistService.getPlaylists()
            .then(playlists => this.playlists = playlists);
    }
    add(name: string): void {
        name = name.trim();
        if (!name) { return; }
        this.playlistService.create(name)
            .then(playlist => {
            this.playlists.push(playlist);
            //this.selectedHero = null;
            this.getPlaylists();
            });
    }
}