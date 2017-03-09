import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PlaylistService} from '../../services/playlist.service';
import { Playlist } from '../../models/playlist'

@Component({
    moduleId: module.id,
    selector: 'my-playlist',
    templateUrl: 'playlist.component.html',
    styles: [ require('./playlist.component.less') ]
})

export class PlaylistComponent implements OnInit {
    constructor(
        private playlistService: PlaylistService,
        private router: Router) { }
    playlists: Playlist[];
    ngOnInit() 
    { 
        this.getPlaylists();
    }
    getPlaylists(): void {
        this.playlistService.getPlaylists()
            .then(playlists => this.playlists = playlists);
    }
}