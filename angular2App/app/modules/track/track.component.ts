import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Track } from '../../models/track';
import { TrackService } from '../../services/track.service';
import { Location }                 from '@angular/common';
import { SimpleTimer } from 'ng2-simple-timer';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'my-track',
    templateUrl: 'track.component.html',
    styles: [ require('./track.component.less') ],
})
export class TrackComponent implements OnInit, OnDestroy {
    //viewList: boolean = false;
    timerId: string;
    track = new Track();
    notFirstTime: boolean = false;
    ngOnInit(): void 
    {
        this.st.newTimer('5sec', 10);
        this.timerId = this.st.subscribe('5sec', e => this.callback());

        this.getInfo();
    } 

    ngOnDestroy(): void
    {
        this.st.delTimer('5sec');
    }

    constructor(
        private infoService: TrackService,
        private router: Router,
        private st: SimpleTimer,
        private location: Location,
        private route: ActivatedRoute) { }

    getInfo(): void {
        let urlParts = this.router.url.split("/");
        let parameter = urlParts[urlParts.length-1];
        this.infoService.getTrack(+parameter)
            .then(track => this.track = track);
        //this.viewList = this.info.label_right_down_2 == "";
    }
    callback() {
        
    }
}


