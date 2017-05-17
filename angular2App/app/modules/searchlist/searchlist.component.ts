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
        private playerService: PlayerService
        ) { }


    ngOnInit() {
        
        
        this.route.params.subscribe((params: Params) => this.query = params['id']);

        this.route.params
            .switchMap((params: Params) => this.spotifyService.search(params['id'],"track"))
            .subscribe((tracklist: SpotifyTrack[]) => 
            {
                this.spotifyTracks = tracklist;
            });
        this.route.params
            .switchMap((params: Params) => this.youtubeApiService.search(params['id']))
            .subscribe((youtubeVideos: YoutubeVideo[]) => 
            {
                this.youtubeVideos = youtubeVideos;
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
     addVideoToPlaylist(playlist: number, video: YoutubeVideo)
     {
        console.log(playlist + " " + video.snippet.title);
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
            console.log(result);
        });
    }*/
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
    onYoutubeSelect(video: YoutubeVideo)
    {
        let tempTrack: Track = new Track();
        tempTrack.address = video.id.videoId;
        tempTrack.id = 99999;
        tempTrack.name = video.snippet.title
        tempTrack.playlist = 99999;
        tempTrack.type = 1;

        let tracklist: Track[] = [];
        tracklist.push(tempTrack);
        this.playerService.setTrackList(tracklist);
        this.playerService.setTrack(tempTrack);
    }
}