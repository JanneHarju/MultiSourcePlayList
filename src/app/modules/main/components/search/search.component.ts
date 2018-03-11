import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../../../services/spotify.service';
import { Router } from '@angular/router';

@Component({
    selector: 'my-search',
    templateUrl: 'search.component.html',
    styleUrls: [ './search.component.css' ],
})

export class SearchComponent implements OnInit {
    constructor(
        private spotifyService: SpotifyService,
        private router: Router) { }

    ngOnInit() { }
    search(q: string): void {

        this.router.navigate(['../main/searchlist', q]);
    }
}
