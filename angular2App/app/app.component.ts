import { Component, OnInit } from '@angular/core';
import { SpotifyService } from './services/spotify.service';
// AoT compilation doesn't support 'require'.
import './app.component.scss';
import '../style/app.scss';

@Component({
  selector: 'my-app',
  templateUrl: 'app.component.html',
  styles: [ require('./app.component.scss'),require('./app2.component.css') ],
})
export class AppComponent implements OnInit
{
    title = 'Multisource playlist';
    constructor(
        private spotifyService: SpotifyService) { }
    ngOnInit(): void 
    {
        this.spotifyService.login().then(token => {
            console.log("login onnistui");
            this.spotifyService.getCurrentUser().subscribe(user =>
            {
                console.log("userin haku onnistui onnistui");
            })
        });
    }
}


