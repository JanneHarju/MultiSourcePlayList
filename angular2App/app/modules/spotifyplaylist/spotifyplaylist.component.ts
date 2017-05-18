import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { SpotifyService, SpotifyOptions } from '../../services/spotify.service';
import { YoutubeAPIService } from '../../services/youtubeapi.service';
import { SpotifyTrack } from '../../models/spotifytrack';
import { YoutubeVideo } from '../../models/youtubeVideo';
import { PlaylistService} from '../../services/playlist.service';
import { Playlist } from '../../models/playlist'
import { Track } from '../../models/track'
import { SpotifyPlaylistTrack } from '../../models/spotifyplaylisttrack'
import { SpotifyTracklist } from '../../models/spotifytracklist';
import { TrackService }         from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import 'rxjs/add/operator/toPromise';

@Component({
    selector: 'my-spotifyplaylist',
    templateUrl: 'spotifyplaylist.component.html',
    styles: [ require('./spotifyplaylist.component.less') ],
})

export class SpotifyPlaylistComponent implements OnInit {
    spotifyTracks : SpotifyPlaylistTrack[] = [];
    playlists: Playlist[] = [];
    query: string = "";
    constructor(
        private route: ActivatedRoute,
        private spotifyService: SpotifyService,
        private youtubeApiService: YoutubeAPIService,
        private playlistService: PlaylistService,
        private trackService: TrackService,
        private playerService: PlayerService
        ) { }


    ngOnInit() {
        
        
        this.route.params.subscribe((params: Params) => this.query = params['id']);

        let limit = 100;
        this.spotifyTracks  = [];
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getPlaylistTracks(params['id'],
                {
                    limit: limit
                }))
            .subscribe((tracklist: SpotifyTracklist) => 
            {

                this.spotifyTracks  = [];
                this.spotifyTracks = this.spotifyTracks.concat(tracklist.items);
                let promises = [],
                total = tracklist.total,
                offset = tracklist.offset;
                while(total > limit + offset)
                {

                    console.log("Whilessä: "+ offset);
                    this.route.params
                    .switchMap((params: Params) => this.spotifyService.getPlaylistTracks(params['id'],
                        {
                            limit: limit,
                            offset: offset + limit
                        }))
                    .subscribe((innerResult: SpotifyTracklist) => 
                    {
                        this.spotifyTracks = this.spotifyTracks.concat(innerResult.items);
                    });
                    offset += limit;
                }
                /*promises.forEach(callback => 
                {
                    console.log("Whilessä: "+ callback);
                    callback.then(result => 
                    {

                        this.spotifyTracks = this.spotifyTracks.concat(result.items);
                    })
                });*/
            });
        this.playlistService.getPlaylists()
            .then((playlists : Playlist[])=> this.playlists = playlists);
     }
     addSpotifyTrackToPlaylist(playlist: number, track: SpotifyTrack)
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
     
    onSpotifySelect(track: SpotifyTrack)
    {
        let tempTrack: Track = new Track();
        tempTrack.address = track.uri;
        tempTrack.id = 99999;
        tempTrack.name = track.artists[0].name + " - " + track.name;
        tempTrack.playlist = 99999;
        tempTrack.type = 2;

        let tracklist: Track[] = [];
        tracklist.push(tempTrack);
        this.playerService.setTrackList(tracklist);
        this.playerService.setTrack(tempTrack);

    }
    
}