import { Subject } from 'rxjs';
import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { Router } from '@angular/router';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'my-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {
  private unSub = new Subject();
  constructor(
    private spotifyService: SpotifyService,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    var search = window.location.search;
    if (search.substring(1).indexOf('error') !== -1) {
      // login failure
      console.error(search);
    } else if (search) {
      // login success
      var state = search.split('&')[1].split('=')[1];
      var storedState = localStorage.getItem('spotify_auth_state');
      if (storedState !== null && state !== null && storedState === state) {
        var code = search.split('&')[0].split('=')[1];
        localStorage.setItem('spotify-code', code);
        localStorage.removeItem('spotify_auth_state');
        this.applicationRef.isStable.takeUntil(this.unSub).subscribe((x) => {
          if (x) {
            console.log('callback isstable');
            this.spotifyService.startGetToken(code).then((result) => {
              console.log('token was get');
              this.zone.run(() => {
                this.router.navigate(['/main']);
              });
            });
            this.unSub.next();
          }
        });
      } else {
        console.error('state was wrong');
      }
    }
  }
}
