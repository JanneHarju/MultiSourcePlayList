import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { YoutubeAPIService } from '../../services/youtubeapi.service';
import { SpotifyTrack } from '../../models/spotifytrack';
import { YoutubeVideo } from '../../models/youtubeVideo';
import { PlaylistService} from '../../services/playlist.service';
import { AuthService } from '../../services/auth.service';
import { Playlist } from '../../models/playlist'
import { Track } from '../../models/track'
import { TrackService }         from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { BandcampService, BandcampOptions } from '../..//services/bandcamp.service';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
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
    selectedSpotifyTrack: SpotifyTrack = new SpotifyTrack();
    selectedYoutubeVideo: YoutubeVideo = new YoutubeVideo();
    subscriptionTrack: Subscription;
    subscriptionPlaylistsModified: Subscription;
    tempSpotifyPlaylistId: number = -4;
    tempYoutubePlaylistId: number = -5;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private youtubeApiService: YoutubeAPIService,
        private playlistService: PlaylistService,
        private trackService: TrackService,
        private bandcampService: BandcampService,
        private playerService: PlayerService
        ) { }


    ngOnInit() {
        
        
        this.route.params.subscribe((params: Params) => this.query = params['id']);

        this.route.params.subscribe((params: Params) => this.spotifyService.search(params['id'],"track")
            .subscribe((tracklist: SpotifyTrack[]) => 
            {
                this.spotifyTracks = tracklist;
                this.selectCurrentTrack(this.playerService.track);
            }));
        this.route.params.subscribe((params: Params) => this.youtubeApiService.search(params['id'])
            .subscribe((youtubeVideos: YoutubeVideo[]) => 
            {
                this.youtubeVideos = youtubeVideos;
                this.selectCurrentTrack(this.playerService.track);
            }));
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => 
        {
            this.selectCurrentTrack(track);
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
        this.getUsersPlaylists();
        this.subscriptionPlaylistsModified = this.playlistService.getPlaylistsModified().subscribe(updated =>
        {
            this.getUsersPlaylists();
        });
     }
     getUsersPlaylists()
     {
         this.playlistService.getUsersPlaylists()
            .then((playlists : Playlist[])=> 
            {
                this.playlists = playlists;
            })
            .catch(err =>
            {
                console.log("Some error occured" + err);
                if(err.status == 401)
                {
                    console.log("Unauthorized");
                    this.authService.clearLoginToken();
                    this.router.navigate(['login']);
                }
            });
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
     selectCurrentTrack(track: Track)
     {
        let temptrack = this.spotifyTracks.find(x=>x.uri == track.address);
        if(temptrack)
        {
            if(this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tempSpotifyPlaylistId))
            {
                this.selectedSpotifyTrack = temptrack;
                this.selectedYoutubeVideo = null;
                //this doesn't work because of two divs which have own scrollbars.
                //This scrolls only left one not the right one.
                /*var element = document.getElementsByClassName("active")[0];
                if(element)
                    element.scrollIntoView()*/
            }
        }
        else
        {
            let tempvideo = this.youtubeVideos.find(x=>x.id.videoId == track.address);
            if(tempvideo)
            {
                if(this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tempYoutubePlaylistId))
                {
                    this.selectedYoutubeVideo = tempvideo;
                    this.selectedSpotifyTrack = null;
                    //this doesn't work because of two divs which have own scrollbars.
                    //This scrolls only left one not the right one.
                    /*var element = document.getElementsByClassName("active")[0];
                    if(element)
                        element.scrollIntoView()*/
                }
            }
        }
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
        newPlaylist.id = this.tempSpotifyPlaylistId;
        newPlaylist.name = "Spotify Search :"+this.query;
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
        newPlaylist.id = this.tempYoutubePlaylistId;
        newPlaylist.name = "Youtube Search :"+this.query;
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