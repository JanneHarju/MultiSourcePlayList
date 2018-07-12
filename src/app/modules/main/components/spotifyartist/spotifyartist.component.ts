import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SpotifyService, SpotifyOptions } from '../../../../services/spotify.service';
import { YoutubeAPIService } from '../../../../services/youtubeapi.service';
import { SpotifyTrack } from '../../../../models/spotifytrack';
import { AuthService } from '../../../../services/auth.service';
import { YoutubeVideo } from '../../../../models/youtubeVideo';
import { PlaylistService} from '../../../../services/playlist.service';
import { Playlist } from '../../../../models/playlist';
import { Track } from '../../../../models/track';
import { SpotifyPlaylistTrack } from '../../../../models/spotifyplaylisttrack';
import { SpotifyPlaylistInfo } from '../../../../models/spotifyplaylistinfo';
import { SpotifyAlbum } from '../../../../models/spotifyalbum';
import { SpotifyArtist } from '../../../../models/spotifyartist';
import { SpotifyTracklist } from '../../../../models/spotifytracklist';
import { TrackService } from '../../../../services/track.service';
import { LoadingService } from '../../../../services/loading.service';
import { PlayerService } from '../../../../services/player.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';

@Component({
    selector: 'my-spotifyartist',
    templateUrl: 'spotifyartist.component.html',
    styleUrls: [ './spotifyartist.component.css' ],
})

export class SpotifyArtistComponent implements OnInit, OnDestroy {
    spotifyTracks: SpotifyTrack[] = [];
    spotifyAlbums: SpotifyAlbum[] = [];
    spotifyArtist: SpotifyArtist = new SpotifyArtist();
    albumDuration = 0;
    trackCount = 0;
    playlists: Playlist[] = [];
    playlistInfo: SpotifyPlaylistInfo = new SpotifyPlaylistInfo();
    query = '';
    selectedTrack: SpotifyTrack = new SpotifyTrack();
    subscriptionTrack: Subscription;
    subscriptionPlaylistsModified: Subscription;
    tempPlaylistId = -2;
    artistLoaded = false;
    albumsLoaded = false;
    toptracksLoaded = false;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private youtubeApiService: YoutubeAPIService,
        private playlistService: PlaylistService,
        private trackService: TrackService,
        private playerService: PlayerService,
        private loadingService: LoadingService
        ) { }


    ngOnInit() {


        this.route.params.subscribe((params: Params) => this.query = params['id']);
        // bring here ownerId as well playlist id
        const limit = 50;
        this.spotifyTracks  = [];

        this.route.params
            .switchMap((params: Params) => {
                this.artistLoaded = false;
                this.albumsLoaded = false;
                this.toptracksLoaded = false;
                setTimeout(() => this.loadingService.setLoading(true));
                return this.spotifyService.getArtist(params['id'],
                {
                    limit: limit
                });
            })
            .subscribe((artist: SpotifyArtist) => {
                this.spotifyArtist = artist;
                this.artistLoaded = true;
                this.setLoadingOffIfAllLoaded();
            }, error => {
                setTimeout(() => this.loadingService.setLoading(false));
            });
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getArtistsAlbum(params['id'],
                {
                    limit: limit
                }))
            .subscribe((albums: SpotifyAlbum[]) => {
                const templist: SpotifyAlbum[] = [];
                albums.forEach(album => {
                    if (templist.find(tem => tem.name === album.name) === undefined) {
                        templist.push(album);
                    }
                });
                this.spotifyAlbums = templist;
                this.albumsLoaded = true;
                this.setLoadingOffIfAllLoaded();
            }, error => {
                setTimeout(() => this.loadingService.setLoading(false));
            });
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getArtistsTopTracks(params['id'],
                {
                    country: 'FI'
                }))
            .subscribe((tracks: SpotifyTrack[]) => {
                this.spotifyTracks = tracks;
                this.toptracksLoaded = true;
                this.setLoadingOffIfAllLoaded();
            }, error => {
                setTimeout(() => this.loadingService.setLoading(false));
            });
        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => {
            this.selectCurrentTrack(track);
        });
        this.getUsersPlaylists();
        this.subscriptionPlaylistsModified = this.playlistService.getPlaylistsModified().subscribe(updated => {
            this.getUsersPlaylists();
        });
    }
    ngOnDestroy(): void {
        this.subscriptionTrack.unsubscribe();
        this.subscriptionPlaylistsModified.unsubscribe();
    }
     getUsersPlaylists() {
         this.playlistService.getUsersPlaylists()
            .then((playlists: Playlist[]) => {
                this.playlists = playlists;
            })
            .catch(err => {
                console.log('Some error occured' + err);
                if (err.status === 401) {
                    console.log('Unauthorized');
                    this.authService.clearLoginToken();
                    this.router.navigate(['/login']);
                }
            });
     }
     private setLoadingOffIfAllLoaded() {
        if (this.artistLoaded &&
            this.albumsLoaded &&
            this.toptracksLoaded) {
            setTimeout(() => this.loadingService.setLoading(false));
        }
     }
     selectCurrentTrack(track: Track) {
        const temptrack = this.spotifyTracks.find(x => x.uri === track.Address);
        if (this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tempPlaylistId)) {
            if (temptrack) {
                this.selectedTrack = temptrack;
                // this doesn't work because of two divs which have own scrollbars.
                // This scrolls only left one not the right one.
                /*var element = document.getElementsByClassName("active")[0];
                if(element)
                    element.scrollIntoView()*/
            }
        }
     }
     addSpotifyTrackToPlaylist(playlist: Playlist, track: SpotifyTrack) {
        this.loadingService.setLoading(true);
        const newTrack: Track = new Track();
        const trackList: Track[] = [];
        newTrack.Address = track.uri;
        newTrack.Name = track.artists[0].name + ' - ' + track.name;
        newTrack.Type = 2;
        newTrack.Playlist = playlist;
        trackList.push(newTrack);
        this.trackService.createMany(trackList).then(ret => {
            this.loadingService.setLoading(false);
        })
        .catch(err => {
            this.loadingService.setLoading(false);
        });
     }
     addAllSpotifyTrackToPlaylist(playlist: Playlist) {
        const trackList: Track[] = [];
        this.spotifyTracks.forEach(st => {

            const newTrack: Track = new Track();
            newTrack.Address = st.uri;
            newTrack.Name = st.artists[0].name + ' - ' + st.name;
            newTrack.Type = 2;
            newTrack.Playlist = playlist;
            trackList.push(newTrack);
        });
        this.trackService.createMany(trackList).then(ret => {

        });
     }
    onSpotifySelect(track: SpotifyTrack) {
        const trackList: Track[] = [];
        let order = 0;
        const newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempPlaylistId;
        newPlaylist.Name = this.spotifyArtist.name + ' - TOP10';
        this.spotifyTracks.forEach(st => {

            const newTrack: Track = new Track();
            newTrack.Address = st.uri;
            newTrack.Name = st.artists[0].name + ' - ' + st.name;
            newTrack.Type = 2;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = order;
            ++order;
            trackList.push(newTrack);
        });
        this.playerService.setTrackList(trackList);
        const tempTrack = trackList.find(tr => tr.Address === track.uri);
        this.playerService.setTrack(tempTrack);

    }
    addToQueue(track: SpotifyTrack) {
        const newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempPlaylistId;
        newPlaylist.Name = 'Spotify : ' + this.playlistInfo.name;
        const newTrack: Track = new Track();
            newTrack.Address = track.uri;
            newTrack.Name = track.artists[0].name + ' - ' + track.name;
            newTrack.Type = 2;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = 0;
        this.playerService.addTrackToQueue(newTrack);
    }
}
