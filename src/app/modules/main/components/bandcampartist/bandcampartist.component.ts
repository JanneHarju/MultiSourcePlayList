import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { LoadingService } from '../../../../services/loading.service';
import { BandcampService } from '../../../..//services/bandcamp.service';
import { AlbumInfo } from '../../../../json_schema/BandCampAlbumInfo';
import 'rxjs/add/operator/toPromise';

@Component({
    selector: 'my-bandcampartist',
    templateUrl: 'bandcampartist.component.html',
    styleUrls: [ './bandcampartist.component.css' ],
})
export class BandcampArtistComponent implements OnInit {

    artistUrl = '';
    artistLink = '';
    albumUrls: string[] = [];
    imageUrl = '';
    albumCount = 0;
    bandCampAlbumInfos: AlbumInfo[] = [];
    artistName = '';
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private bandcampService: BandcampService,
        private loadingService: LoadingService
        ) { }


    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            setTimeout(() => this.loadingService.setLoading(true));
            this.artistUrl = params['id'];
            this.artistLink = atob(this.artistUrl);
            this.imageUrl = atob(params['id2']);
            this.artistName = params['id3'];
            this.bandcampService.bandCampAlbumUrls(this.artistUrl)
                .then( (res: string[]) => {
                    this.albumUrls = res.filter(x => x.includes('/album/'));
                    this.albumCount = this.albumUrls.length;
                    if (this.albumCount === 0) {
                        setTimeout(() => this.loadingService.setLoading(false));
                        return;
                    }
                    this.albumUrls.forEach(x => {
                        this.bandcampService.bandCampAlbumInfo(btoa(x))
                            .then( (y: AlbumInfo) => {
                                this.bandCampAlbumInfos.push(y);
                                if (this.bandCampAlbumInfos.length >= this.albumCount) {
                                    setTimeout(() => this.loadingService.setLoading(false));
                                }
                            });
                    });
                });
        });
    }
    urlToBase64(url: string) {
        return btoa(url);
    }
}
