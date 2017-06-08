import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import { SpotifyService, SpotifyOptions } from '../../services/spotify.service';
import { YoutubeAPIService } from '../../services/youtubeapi.service';
import { SpotifyTrack } from '../../models/spotifytrack';
import { AuthService } from '../../services/auth.service';
import { YoutubeVideo } from '../../models/youtubeVideo';
import { PlaylistService} from '../../services/playlist.service';
import { Playlist } from '../../models/playlist'
import { Track } from '../../models/track'
import { SpotifyPlaylistTrack } from '../../models/spotifyplaylisttrack'
import { SpotifyPlaylistInfo } from '../../models/spotifyplaylistinfo';
import { SpotifyAlbum } from '../../models/spotifyalbum';
import { SpotifyArtist } from '../../models/spotifyartist';
import { SpotifyTracklist } from '../../models/spotifytracklist';
import { TrackService }         from '../../services/track.service';
import { PlayerService } from '../../services/player.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';

@Component({
    selector: 'my-spotifyartist',
    templateUrl: 'spotifyartist.component.html',
    styles: [ require('./spotifyartist.component.less') ],
})

export class SpotifyArtistComponent implements OnInit {
    spotifyTracks : SpotifyTrack[] = [];
    spotifyAlbums : SpotifyAlbum[] = [];
    spotifyArtist : SpotifyArtist = new SpotifyArtist();
    albumDuration: number = 0;
    trackCount: number = 0;;
    playlists: Playlist[] = [];
    playlistInfo: SpotifyPlaylistInfo = new SpotifyPlaylistInfo();
    query: string = "";
    selectedTrack: SpotifyTrack = new SpotifyTrack();
    subscriptionTrack: Subscription;
    subscriptionPlaylistsModified: Subscription;
    tempLaylistId: number = -2;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private youtubeApiService: YoutubeAPIService,
        private playlistService: PlaylistService,
        private trackService: TrackService,
        private playerService: PlayerService
        ) { }


    ngOnInit() {
        
        
        this.route.params.subscribe((params: Params) => this.query = params['id']);
        //bring here ownerId as well playlist id
        let limit = 50;
        this.spotifyTracks  = [];
        
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getArtist(params['id'],
                {
                    limit: limit
                }))
            .subscribe((artist: SpotifyArtist) => 
            {
                this.spotifyArtist = artist;
            });
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getArtistsAlbum(params['id'],
                {
                    limit: limit
                }))
            .subscribe((albums: SpotifyAlbum[]) => 
            {
                console.log(albums);
                let templist :SpotifyAlbum[] = [];
                albums.forEach(album =>
                {
                    if(templist.find(tem => tem.name == album.name)==undefined)
                    {
                        templist.push(album);
                    }
                });
                this.spotifyAlbums = templist;
            });
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getArtistsTopTracks(params['id'],
                {
                    country: "FI"
                }))
            .subscribe((tracks: SpotifyTrack[]) => 
            {
                this.spotifyTracks = tracks;
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
        let temptrack = this.spotifyTracks.find(x=>x.uri == track.address);
        if(this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tempLaylistId))
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
            newTrack.address = st.uri;
            newTrack.name = st.artists[0].name +" - "+ st.name;
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
        newPlaylist.id = this.tempLaylistId;
        newPlaylist.name = this.spotifyArtist.name + " - TOP10";
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
    
}