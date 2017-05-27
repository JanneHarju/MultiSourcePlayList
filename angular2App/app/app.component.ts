import { Component } from '@angular/core';
import { SpotifyService } from './services/spotify.service';
// AoT compilation doesn't support 'require'.
import '../style/app.css';

@Component({
  selector: 'my-app',
  templateUrl: 'app.component.html',
  styles: [require('./app.component.css') ],
})
export class AppComponent
{
    title = 'Multisource playlist';
    constructor() { }
    
}


