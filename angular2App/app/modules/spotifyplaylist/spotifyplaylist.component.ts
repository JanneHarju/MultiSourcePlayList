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
import { SpotifyPlaylistInfo } from '../../models/spotifyplaylistinfo';
import { SpotifyTracklist } from '../../models/spotifytracklist';
import { TrackService }         from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';

@Component({
    selector: 'my-spotifyplaylist',
    templateUrl: 'spotifyplaylist.component.html',
    styles: [ require('./spotifyplaylist.component.less') ],
})

export class SpotifyPlaylistComponent implements OnInit {
    spotifyTracks : SpotifyPlaylistTrack[] = [];
    playlists: Playlist[] = [];
    playlistInfo: SpotifyPlaylistInfo = new SpotifyPlaylistInfo();
    query: string = "";
    selectedTrack: SpotifyTrack = new SpotifyTrack();
    subscriptionTrack: Subscription;
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
        //bring here ownerId as well playlist id
        let limit = 100;
        this.spotifyTracks  = [];
        
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getPlaylistTracks(params['id'],params['id2'],
                {
                    limit: limit
                }))
            .subscribe((tracklist: SpotifyTracklist) => 
            {
                this.spotifyTracks  = [];
                
                this.spotifyTracks = this.spotifyTracks.concat(tracklist.items.filter(tra => !tra.is_local && tra.track));
                this.selectCurrentTrack(this.playerService.track);
                let promises = [],
                total = tracklist.total,
                offset = tracklist.offset;
                while(total > limit + offset)
                {
                    this.route.params
                    .switchMap((params: Params) => this.spotifyService.getPlaylistTracks(params['id'],params['id2'],
                        {
                            limit: limit,
                            offset: offset + limit
                        }))
                    .subscribe((innerResult: SpotifyTracklist) => 
                    {
                        this.spotifyTracks = this.spotifyTracks.concat(innerResult.items.filter(tra => !tra.is_local && tra.track));
                        this.selectCurrentTrack(this.playerService.track);
                    });
                    offset += limit;
                }
            });
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getPlaylistInfo(params['id'],params['id2']))
            .subscribe((playlistInfo: SpotifyPlaylistInfo) => 
            {
                this.playlistInfo = playlistInfo;
            });
        
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => 
        {
            this.selectCurrentTrack(track);
        });
        this.playlistService.getUsersPlaylists()
            .then((playlists : Playlist[])=> this.playlists = playlists);
     }
     selectCurrentTrack(track: Track)
     {
        let temptrack = this.spotifyTracks.find(x=>x.track.uri == track.address);
            if(temptrack)
            {
                this.selectedTrack = temptrack.track;
                //this doesn't work because of two divs which have own scrollbars.
                //This scrolls only left one not the right one.
                /*var element = document.getElementsByClassName("active")[0];
                if(element)
                    element.scrollIntoView()*/
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
     addAllSpotifyTrackToPlaylist(playlist: Playlist)
     {
        let trackList: Track[] = [];
        this.spotifyTracks.forEach(st =>
        {

            let newTrack: Track = new Track();
            newTrack.address = st.track.uri;
            newTrack.name = st.track.artists[0].name +" - "+ st.track.name;
            newTrack.type = 2;
            newTrack.playlist = playlist;
            trackList.push(newTrack);
        });
        this.trackService.createMany(trackList).then(ret =>
        {

        });
     }
    onSpotifySelect(track: SpotifyTrack)
    {
        let trackList: Track[] = [];
        let order: number = 0;
        let newPlaylist: Playlist = new Playlist();
        newPlaylist.id = 99999;
        this.spotifyTracks.forEach(st =>
        {

            let newTrack: Track = new Track();
            newTrack.address = st.track.uri;
            newTrack.name = st.track.artists[0].name +" - "+ st.track.name;
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
    
}