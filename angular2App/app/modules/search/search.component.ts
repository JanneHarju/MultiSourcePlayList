import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { Router }                 from '@angular/router';

@Component({
    selector: 'my-search',
    templateUrl: 'search.component.html',
    styles: [ require('./search.component.less') ],
})

export class SearchComponent implements OnInit {
    constructor(
        private spotifyService: SpotifyService,
        private router: Router) { }

    ngOnInit() { }
    search(q: string): void {
        //naigoidaan tässä

        this.router.navigate([{ outlets: { popup: 'addtrackpopup' }}]);
        this.router.navigate(['/searchlist', q]);
    }
}