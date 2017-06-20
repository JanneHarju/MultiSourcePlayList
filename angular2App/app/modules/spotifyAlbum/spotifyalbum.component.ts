import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import { SpotifyService, SpotifyOptions } from '../../services/spotify.service';
import { YoutubeAPIService } from '../../services/youtubeapi.service';
import { SpotifyTrack } from '../../models/spotifytrack';
import { YoutubeVideo } from '../../models/youtubeVideo';
import { PlaylistService} from '../../services/playlist.service';
import { AuthService } from '../../services/auth.service';
import { Playlist } from '../../models/playlist'
import { Track } from '../../models/track'
import { SpotifyPlaylistTrack } from '../../models/spotifyplaylisttrack'
import { SpotifyPlaylistInfo } from '../../models/spotifyplaylistinfo';
import { SpotifyAlbum } from '../../models/spotifyalbum';
import { SpotifyTracklist } from '../../models/spotifytracklist';
import { TrackService }         from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { LoadingService }         from '../../services/loading.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';

@Component({
    selector: 'my-spotifyalbum',
    templateUrl: 'spotifyalbum.component.html',
    styleUrls: [ './spotifyalbum.component.less' ],
})

export class SpotifyAlbumComponent implements OnInit {
    spotifyTracks : SpotifyTrack[] = [];
    spotifyAlbum : SpotifyAlbum = new SpotifyAlbum();
    albumDuration: number = 0;
    trackCount: number = 0;;
    playlists: Playlist[] = [];
    playlistInfo: SpotifyPlaylistInfo = new SpotifyPlaylistInfo();
    query: string = "";
    selectedTrack: SpotifyTrack = new SpotifyTrack();
    subscriptionTrack: Subscription;
    subscriptionPlaylistsModified: Subscription;
    tempPlaylistId: number = -3;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private spotifyService: SpotifyService,
        private youtubeApiService: YoutubeAPIService,
        private playlistService: PlaylistService,
        private authService: AuthService,
        private trackService: TrackService,
        private playerService: PlayerService,
        private loadingService: LoadingService
        ) { }


    ngOnInit() {
        
        
        this.route.params.subscribe((params: Params) => this.query = params['id']);
        //bring here ownerId as well playlist id
        let limit = 50;
        this.spotifyTracks  = [];
        
        this.route.params
            .switchMap((params: Params) => 
            {
                setTimeout(()=> this.loadingService.setLoading(true));
                return this.spotifyService.getAlbum(params['id'],
                {
                    limit: limit
                });
            })
            .subscribe((album: SpotifyAlbum) => 
            {
                this.spotifyTracks  = [];
                
                this.spotifyTracks = album.tracks.items;
                this.selectCurrentTrack(this.playerService.track);
                this.spotifyAlbum = album;
                
                album.tracks.items.forEach(track =>this.albumDuration = this.albumDuration + track.duration_ms);
                this.trackCount = album.tracks.items.length;
                setTimeout(()=> this.loadingService.setLoading(false));
            },error=>
            {
                setTimeout(()=> this.loadingService.setLoading(false));
            });
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => 
        {
            this.selectCurrentTrack(track);
        });
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
     selectCurrentTrack(track: Track)
     {
        let temptrack = this.spotifyTracks.find(x=>x.uri == track.Address);
        if(this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tempPlaylistId))
        {
            if(temptrack)
            {
                this.selectedTrack = temptrack;
                //this doesn't work because of two divs which have own scrollbars.
                //This scrolls only left one not the right one.
                /*var element = document.getElementsByClassName("active")[0];
                if(element)
                    element.scrollIntoView()*/
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
     addAllSpotifyTrackToPlaylist(playlist: Playlist)
     {

        this.loadingService.setLoading(true);
        let trackList: Track[] = [];
        this.spotifyTracks.forEach(st =>
        {

            let newTrack: Track = new Track();
            newTrack.Address = st.uri;
            newTrack.Name = st.artists[0].name +" - "+ st.name;
            newTrack.Type = 2;
            newTrack.Playlist = playlist;
            trackList.push(newTrack);
        });
        this.trackService.createMany(trackList).then(ret =>
        {
            this.loadingService.setLoading(false);
        })
        .catch(err=>
        {
            this.loadingService.setLoading(false);
        });
     }
    onSpotifySelect(track: SpotifyTrack)
    {
        let trackList: Track[] = [];
        let order: number = 0;
        let newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempPlaylistId;
        newPlaylist.Name = this.spotifyAlbum.artists[0].name + " - " + this.spotifyAlbum.name;
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
    addToQueue(track: SpotifyTrack)
    {
        let newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempPlaylistId;
        newPlaylist.Name = "Spotify : "+this.playlistInfo.name;
        let newTrack: Track = new Track();
            newTrack.Address = track.uri;
            newTrack.Name = track.artists[0].name +" - "+ track.name;
            newTrack.Type = 2;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = 0;
        this.playerService.addTrackToQueue(newTrack);
    }
}