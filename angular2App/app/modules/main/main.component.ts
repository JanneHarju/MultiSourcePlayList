import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
// AoT compilation doesn't support 'require'.

@Component({
  selector: 'my-main',
  templateUrl: 'main.component.html',
  styles: [require('./main.component.less') ],
})
export class MainComponent implements OnInit
{
    constructor(
        private spotifyService: SpotifyService) { }
    ngOnInit(): void 
    {
        this.spotifyService.login(false).then(token => {
            
        });
    }
}
