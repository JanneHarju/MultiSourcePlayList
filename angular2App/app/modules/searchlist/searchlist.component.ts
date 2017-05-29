import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { YoutubeAPIService } from '../../services/youtubeapi.service';
import { SpotifyTrack } from '../../models/spotifytrack';
import { YoutubeVideo } from '../../models/youtubeVideo';
import { PlaylistService} from '../../services/playlist.service';
import { Playlist } from '../../models/playlist'
import { Track } from '../../models/track'
import { TrackService }         from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { BandcampService, BandcampOptions } from '../..//services/bandcamp.service';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';

//var bandcamp = require('../../../../../node_modules/bandcamp-scraper/lib/index.js');
//var bandcamp = require('../../../../node_modules/bandcamp-scraper/lib/index');
var bandcamp = require('bandcamp-scraper');

/*var req         = require("tinyreq"),
    urlHelper   = require('url'),
    htmlParser  = require('../../../../node_modules/bandcamp-scraper/lib/htmlParser.js'),
    utils       = require('../../../../node_modules/bandcamp-scraper/lib/utils.js');
declare function search(params: any, cb: any) : Observable<any>;*/

@Component({
    selector: 'my-searchlist',
    templateUrl: 'searchlist.component.html',
    styles: [ require('./searchlist.component.less') ],
})

export class SearchlistComponent implements OnInit {
    spotifyTracks : SpotifyTrack[] = [];
    youtubeVideos : YoutubeVideo[] = [];
    playlists: Playlist[] = [];
    query: string = "";
    constructor(
        private route: ActivatedRoute,
        private spotifyService: SpotifyService,
        private youtubeApiService: YoutubeAPIService,
        private playlistService: PlaylistService,
        private trackService: TrackService,
        private bandcampService: BandcampService,
        private playerService: PlayerService
        ) { }


    ngOnInit() {
        
        
        this.route.params.subscribe((params: Params) => this.query = params['id']);

        this.spotifyService.search(this.query,"track")
            .subscribe((tracklist: SpotifyTrack[]) => 
            {
                this.spotifyTracks = tracklist;
            });
        this.youtubeApiService.search(this.query)
            .subscribe((youtubeVideos: YoutubeVideo[]) => 
            {
                this.youtubeVideos = youtubeVideos;
            });
        /*var params = {
            query: this.query,
            page: 1
        };

        this.doBandcampCall(params).then(res =>
        {
            console.log(res);
        })
        .catch(err =>
        {
            console.error(err);
        });*/


        /*this.bandcampService.doBandcampCall(params).then(ret=>
        {
            console.log(ret);
        })
        .catch(err =>
        {
            console.error(err);
        });*/
        //this.bandcampSearch(this.query);
        /*this.playlistService.getUsersPlaylists()
            .then((playlists : Playlist[])=> this.playlists = playlists);*/

     }
     bcsearch()
     {
        var params : BandcampOptions = {
            page: 1,
            q: this.query
        };
        this.bandcampService.doBandcampCall(params).then(ret=>
        {
            console.log(ret);
        })
        .catch(err =>
        {
            console.error(err);
        });
     }
     bandcampSearch(q: string)
     {
        var params = {
            query: q,
            page: 1
        };

        bandcamp.search(params, (error: string, searchResults: string) => {
            if (error)
            {
                console.log(error);
            }
            else
            {
                console.log(searchResults);
            }
        });
     }
     doBandcampCall(q: Object) {
        return new Promise(function(resolve, reject) {
            bandcamp.search(q, function(err:any, result:any) {
                if (err) return reject(err);
                resolve(result);
            });
        });
     }
     
     addSpotifyTrackToPlaylist(playlist: Playlist, track: SpotifyTrack)
     {
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
     addVideoToPlaylist(playlist: Playlist, video: YoutubeVideo)
     {
        let newTrack: Track = new Track();
        let trackList: Track[] = [];
        newTrack.address = video.id.videoId;
        newTrack.name = video.snippet.title;
        newTrack.type = 1;
        newTrack.playlist = playlist;
        trackList.push(newTrack);
        this.trackService.createMany(trackList).then(ret =>
        {

        });
     }
     /*search(q: string): void {
        this.spotifyService.search(q,"track").subscribe(result =>
        {
        });
    }*/
    onSpotifySelect(track: SpotifyTrack)
    {
        let trackList: Track[] = [];
        let order: number = 0;
        let newPlaylist: Playlist = new Playlist();
        newPlaylist.id = 99999;
        this.spotifyTracks.forEach(st =>
        {

            let newTrack: Track = new Track();
            newTrack.address = st.uri;
            newTrack.name = st.artists[0].name +" - "+ st.name;
            newTrack.type = 2;
            newTrack.playlist = newPlaylist;
            newTrack.order = order;
            ++order;
            trackList.push(newTrack);
        });
        this.playerService.setTrackList(trackList);
        let tempTrack = trackList.find(tr => tr.address == track.uri);
        this.playerService.setTrack(tempTrack);

    }
    onYoutubeSelect(video: YoutubeVideo)
    {
        let trackList: Track[] = [];
        let order: number = 0;
        let newPlaylist: Playlist = new Playlist();
        newPlaylist.id = 99999;
        this.youtubeVideos.forEach(ytv =>
        {

            let newTrack: Track = new Track();
            newTrack.address = ytv.id.videoId;
            newTrack.id = 99999;
            newTrack.name = ytv.snippet.title
            newTrack.type = 1;
            newTrack.playlist = newPlaylist;
            newTrack.order = order;
            ++order;
            trackList.push(newTrack);
        });
        this.playerService.setTrackList(trackList);
        let tempTrack = trackList.find(tr => tr.address == video.id.videoId);
        this.playerService.setTrack(tempTrack);
    }
}