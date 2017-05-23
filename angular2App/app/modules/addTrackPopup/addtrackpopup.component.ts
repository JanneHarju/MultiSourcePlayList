import { Component, OnInit, HostBinding } from '@angular/core';
import { Router }                 from '@angular/router';
import { TrackService }         from '../../services/track.service';
import { slideInDownAnimation }   from '../shared/animations';
import { ActivatedRoute, Params }   from '@angular/router';
import { Track } from '../../models/track';

@Component({
    templateUrl: 'addtrackpopup.component.html',
    styles: [ require('./addtrackpopup.component.less') ],
    animations: [ slideInDownAnimation ],
    host: {'[@routeAnimation]': ''}
})
export class AddTrackPopupComponent implements OnInit {
    
    trackListId : number = 0;
    currentTracklist: Track[] = [];
    name : string = "";
    private sub: any;
    newTracks : string = "";
    player: YT.Player;
    spotifyAddress : string = "https://embed.spotify.com/?uri=spotify%3Atrack%3A"; 
    constructor(
        private trackService: TrackService,
        private router: Router,
        private route: ActivatedRoute
    ) { }
    ngOnInit() { 
        /*this.sub = this.route.params.subscribe(params => {
            this.trackListId = +params['id'];
        });*/
        let urlParts = this.router.url.split("/");
        let lastpart = urlParts[urlParts.length-1];
        let id = lastpart.split("(")[0];
        this.trackListId = +id;
        this.trackService.getPlaylistTracks(this.trackListId)
            .then(tracklist => this.currentTracklist = tracklist);
        //this.trackListId = +this.route.snapshot.params['id'];
    }
    savePlayer (player: YT.Player) {
        this.player = player;
        }
    onStateChange(event : YT.EventArgs){
    }
    cancel() 
    {
        this.closePopup();
    }
    closePopup() 
    {
        // Providing a `null` value to the named outlet
        // clears the contents of the named outlet
        this.router.navigate([{ outlets: { popup: null }}]);
    }
    add()
    {
        let tracks = this.newTracks.split(/\n/);
        let addIndex = 1;
        let newtracklist : Track[] = [];
        tracks.forEach(track => {
            
            let tr = new Track();
            //tr.address = newtrack;
            tr.order = this.currentTracklist[this.currentTracklist.length -1].order + addIndex;
            //tr.playlist = this.trackListId;
            //https://www.youtube.com/watch?v=ueI_oDqvlkI
            //https://open.spotify.com/track/48UPSzbZjgc449aqz8bxox
            //https://embed.spotify.com/?uri=spotify%3Atrack%3A6VpUZlL6wGaVm98gGUs8Qq

            //https://open.spotify.com/track/64BbK9SFKH2jk86U3dGj2P
            //spotify:track:64BbK9SFKH2jk86U3dGj2P
            /*
            https://www.youtube.com/watch?v=JYlwhwZFAfQ
            https://www.youtube.com/watch?v=NApFewYnD2U
            */
            /*<iframe src="https://embed.spotify.com/?uri=spotify%3Atrack%3A64BbK9SFKH2jk86U3dGj2P" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>*/
            if(track.includes("youtube"))
            {
                tr.type = 1;
                let parameters = track.split("=")[1];
                let id = parameters.split("&")[0];
                tr.address = id;
                /*this.player.loadVideoById(id);
                tr.name = this.player.getVideoData().title;*/
            }
            else if(track.includes("spotify"))
            {
                tr.type = 2;
                let split= track.split("/");
                tr.address = this.spotifyAddress + split[split.length-1];
            }
            else
            {
                tr.type = 3;
            }
            tr.name = this.name;
            ++addIndex;
            newtracklist.push(tr);
            /*this.trackService.create(tr).then(()=>
            {
                //this.router.navigate("/tracklist",this.trackListId);
            });*/

        });
        if(newtracklist.length > 0)
        {
            this.trackService.createMany(newtracklist).then(()=>
            {
                //this.router.navigate("/tracklist",this.trackListId);

                this.router.navigate([{ outlets: { popup: null }}]);
            });
        }
    }
}