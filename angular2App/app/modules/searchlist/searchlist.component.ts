import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { SpotifyTrack } from '../../models/spotifytrack';
import { PlaylistService} from '../../services/playlist.service';
import { Playlist } from '../../models/playlist'
import { Track } from '../../models/track'
import { TrackService }         from '../../services/track.service';

@Component({
    selector: 'my-searchlist',
    templateUrl: 'searchlist.component.html',
    styles: [ require('./searchlist.component.less') ],
})

export class SearchlistComponent implements OnInit {
    spotifyTracks : SpotifyTrack[] = [];
    playlists: Playlist[] = [];
    constructor(
        private route: ActivatedRoute,
        private spotifyService: SpotifyService,
        private playlistService: PlaylistService,
        private trackService: TrackService
        ) { }


    ngOnInit() {
        
        this.route.params
            .switchMap((params: Params) => this.spotifyService.search(params['id'],"track"))
            .subscribe((tracklist: SpotifyTrack[]) => 
            {
                this.spotifyTracks = tracklist;
                console.log(tracklist);
                /*this.tracklist = tracklist;
                if(this.tracklist.length > 0)
                {
                    this.selectedTrack = tracklist[0];
                    this.playerService.setTrackList(this.tracklist);
                    //this.playerService.setTrack(this.selectedTrack);
                }*/
            });
        this.playlistService.getPlaylists()
        .then((playlists : Playlist[])=> this.playlists = playlists);
     }
     addTrackToPlaylist(playlist: number, track: SpotifyTrack)
     {
        console.log(playlist + " " + track.name);
        let newTrack: Track = new Track();
        let trackList: Track[] = [];
        newTrack.address = track.uri;
        newTrack.name = track.artists[0].name +" - "+ track.name;
        newTrack.type = 2;
        newTrack.playlist = playlist;
        trackList.push(newTrack);
        this.trackService.createMany(trackList).then(ret =>
        {

        });
     }
     /*search(q: string): void {
        this.spotifyService.search(q,"track").subscribe(result =>
        {
            console.log(result);
        });
    }*/
}