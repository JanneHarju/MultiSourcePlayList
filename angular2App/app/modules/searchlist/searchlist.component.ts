import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { LoadingService }         from '../../services/loading.service';
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
    styleUrls: [ './searchlist.component.css' ],
})

export class SearchlistComponent implements OnInit, OnDestroy {
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
        private playerService: PlayerService,
        private loadingService: LoadingService
        ) { }


    ngOnInit() {
        
        
        this.route.params.subscribe((params: Params) => this.query = params['id']);

        this.route.params.subscribe((params: Params) => this.spotifyService.search(params['id'],"track")
            .then((tracklist: SpotifyTrack[]) => 
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
    ngOnDestroy(): void
    {
        this.subscriptionPlaylistsModified.unsubscribe();
        this.subscriptionTrack.unsubscribe();
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
        let temptrack = this.spotifyTracks.find(x=>x.uri == track.Address);
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
            let tempvideo = this.youtubeVideos.find(x=>x.id.videoId == track.Address);
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

        this.loadingService.setLoading(true);
        let newTrack: Track = new Track();
        let trackList: Track[] = [];
        newTrack.Address = track.uri;
        newTrack.Name = track.artists[0].name +" - "+ track.name;
        newTrack.Type = 2;
        newTrack.Playlist = playlist;
        trackList.push(newTrack);
        this.trackService.createMany(trackList).then(ret =>
        {
            this.loadingService.setLoading(false);

        })
        .catch(err=>
        {
            this.loadingService.setLoading(false);
        });
     }
     addVideoToPlaylist(playlist: Playlist, video: YoutubeVideo)
     {
        this.loadingService.setLoading(true);
        let newTrack: Track = new Track();
        let trackList: Track[] = [];
        newTrack.Address = video.id.videoId;
        newTrack.Name = video.snippet.title;
        newTrack.Type = 1;
        newTrack.Playlist = playlist;
        trackList.push(newTrack);
        this.trackService.createMany(trackList).then(ret =>
        {
            this.loadingService.setLoading(false);

        })
        .catch(err=>
        {
            this.loadingService.setLoading(false);
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
        newPlaylist.Id = this.tempSpotifyPlaylistId;
        newPlaylist.Name = "Spotify Search : "+this.query;
        this.spotifyTracks.forEach(st =>
        {

            let newTrack: Track = new Track();
            newTrack.Address = st.uri;
            newTrack.Name = st.artists[0].name +" - "+ st.name;
            newTrack.Type = 2;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = order;
            ++order;
            trackList.push(newTrack);
        });
        this.playerService.setTrackList(trackList);
        let tempTrack = trackList.find(tr => tr.Address == track.uri);
        this.playerService.setTrack(tempTrack);

    }
    onYoutubeSelect(video: YoutubeVideo)
    {
        let trackList: Track[] = [];
        let order: number = 0;
        let newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempYoutubePlaylistId;
        newPlaylist.Name = "Youtube Search : "+this.query;
        this.youtubeVideos.forEach(ytv =>
        {

            let newTrack: Track = new Track();
            newTrack.Address = ytv.id.videoId;
            newTrack.Id = 99999;
            newTrack.Name = ytv.snippet.title
            newTrack.Type = 1;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = order;
            ++order;
            trackList.push(newTrack);
        });
        this.playerService.setTrackList(trackList);
        let tempTrack = trackList.find(tr => tr.Address == video.id.videoId);
        this.playerService.setTrack(tempTrack);
    }
    addSpotifyToQueue(track: SpotifyTrack)
    {
        let newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempSpotifyPlaylistId;
        newPlaylist.Name = "Spotify Search : "+this.query;
        let newTrack: Track = new Track();
            newTrack.Address = track.uri;
            newTrack.Name = track.artists[0].name +" - "+ track.name;
            newTrack.Type = 2;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = 0;
        this.playerService.addTrackToQueue(newTrack);
    }
    addYoutubeToQueue(video: YoutubeVideo)
    {
        let newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempSpotifyPlaylistId;
        newPlaylist.Name = "YouTube Search : "+this.query;
        let newTrack: Track = new Track();
            newTrack.Address = video.id.videoId;
            newTrack.Name = video.snippet.title;
            newTrack.Id = 99999;
            newTrack.Type = 1;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = 0;
        this.playerService.addTrackToQueue(newTrack);
    }
}