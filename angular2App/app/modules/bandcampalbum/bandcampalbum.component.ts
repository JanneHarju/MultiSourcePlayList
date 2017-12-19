import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BandcampService } from '../..//services/bandcamp.service';
import { AlbumInfo } from '../../json_schema/BandCampAlbumInfo';
import { LoadingService }         from '../../services/loading.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';

@Component({
    selector: 'my-bandcampalbum',
    templateUrl: 'bandcampalbum.component.html',
    styleUrls: [ './bandcampalbum.component.css' ],
})

export class BandcampAlbumComponent implements OnInit, OnDestroy {
    albumInfo: AlbumInfo;
    albumDuration: number = 0;
    trackCount: number = 0;;
    albumUrl: string = "";
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private bandcampService: BandcampService,
        private loadingService: LoadingService
        ) { }

    ngOnInit() {
        
        this.route.params.subscribe((params: Params) => 
        {
            setTimeout(()=> this.loadingService.setLoading(true));
            this.albumUrl = params['id'];
            this.bandcampService.bandCampAlbumInfo(this.albumUrl)
                .then( (res : AlbumInfo) => 
                {
                    console.log(res);
                    this.albumInfo = res;
                    this.trackCount = this.albumInfo.tracks.length;
                    setTimeout(()=> this.loadingService.setLoading(false));
                });
        });
    }
    ngOnDestroy(): void
    {
        
    }
}