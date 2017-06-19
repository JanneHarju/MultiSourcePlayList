import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs/Subscription';
// AoT compilation doesn't support 'require'.

@Component({
  selector: 'my-main',
  templateUrl: 'main.component.html',
  styles: [require('./main.component.less') ],
  
})
export class MainComponent implements OnInit
{
    loading: boolean = false;
    subscriptionLoading: Subscription;
    constructor(
        private spotifyService: SpotifyService,
        private loadingService: LoadingService) { }
    ngOnInit(): void 
    {
        this.spotifyService.login(false).then(token => {
            
        });
        this.subscriptionLoading = this.loadingService.getLoading().subscribe(loading => 
        {
            this.loading = loading;
        });
    }
}
