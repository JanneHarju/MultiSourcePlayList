import { Component, ViewEncapsulation } from '@angular/core';
import { SpotifyService } from './services/spotify.service';
// AoT compilation doesn't support 'require'.
import '../style/app.css';

@Component({
  selector: 'my-app',
  templateUrl: 'app.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [ './app3.component.css', './app2.component.css']
})
export class AppComponent {

    title = 'Multisource playlist';
    constructor() { }
}


