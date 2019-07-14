import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style } from '@angular/animations';
import { SpotifyService } from '../../../../services/spotify.service';
import { LoadingService } from '../../../../services/loading.service';
import { Subscription } from 'rxjs';
// AoT compilation doesn't support 'require'.

@Component({
  selector: 'my-main',
  templateUrl: 'main.component.html',
  styleUrls: ['./main.component.css'],
  animations: [
    trigger('slideInOut', [
      state(
        'in',
        style({
          display: 'none'
        })
      ),
      state(
        'out',
        style({
          display: 'inherit'
        })
      )
    ])
  ]
})
export class MainComponent implements OnInit, OnDestroy {
  loading = false;
  subscriptionLoading: Subscription;
  menuState = 'in';
  menuStateIn = true;
  constructor(
    private spotifyService: SpotifyService,
    private loadingService: LoadingService,
    private cd: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.subscriptionLoading = this.loadingService.getLoading().subscribe((loading) => {
      this.loading = loading;
      this.cd.detectChanges();
    });
    if (localStorage.getItem('spotify-refresh-token')) {
      console.log('Page reload.');
      this.spotifyService.getTokensByRefreshToken();
    }
  }
  ngOnDestroy(): void {
    this.subscriptionLoading.unsubscribe();
  }
  toggleMenu() {
    // 1-line if statement that toggles the value:
    this.menuState = this.menuState === 'out' ? 'in' : 'out';
    this.menuStateIn = this.menuState === 'in';
  }
}
