import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SpotifyService, SpotifyOptions } from '../../../../services/spotify.service';
import { YoutubeAPIService } from '../../../../services/youtubeapi.service';
import { SpotifyTrack } from '../../../../models/spotifytrack';
import { YoutubeVideo } from '../../../../models/youtubeVideo';
import { PlaylistService} from '../../../../services/playlist.service';
import { AuthService } from '../../../../services/auth.service';
import { Playlist } from '../../../../models/playlist';
import { Track } from '../../../../models/track';
import { SpotifyPlaylistTrack } from '../../../../models/spotifyplaylisttrack';
import { SpotifyPlaylistInfo } from '../../../../models/spotifyplaylistinfo';
import { SpotifyTracklist } from '../../../../models/spotifytracklist';
import { TrackService } from '../../../../services/track.service';
import { PlayerService } from '../../../../services/player.service';
import { LoadingService } from '../../../../services/loading.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';

@Component({
    selector: 'my-spotifyplaylist',
    templateUrl: 'spotifyplaylist.component.html',
    styleUrls: [ './spotifyplaylist.component.css' ],
})

export class SpotifyPlaylistComponent implements OnInit, OnDestroy {
    spotifyTracks: SpotifyPlaylistTrack[] = [];
    playlists: Playlist[] = [];
    playlistInfo: SpotifyPlaylistInfo = new SpotifyPlaylistInfo();
    query = '';
    selectedTrack: SpotifyTrack = new SpotifyTrack();
    subscriptionTrack: Subscription;
    subscriptionPlaylistsModified: Subscription;
    tempPlaylistId = -1;
    numberOfParts = 0;
    numberOfLoadedParts = 0;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private spotifyService: SpotifyService,
        private youtubeApiService: YoutubeAPIService,
        private playlistService: PlaylistService,
        private trackService: TrackService,
        private authService: AuthService,
        private playerService: PlayerService,
        private loadingService: LoadingService
        ) { }


    ngOnInit() {


        this.route.params.subscribe((params: Params) => this.query = params['id']);
        // bring here ownerId as well playlist id
        const limit = 100;
        this.spotifyTracks  = [];

        this.route.params
            .switchMap((params: Params) => {
                setTimeout(() => this.loadingService.setLoading(true));
                return this.spotifyService.getPlaylistTracks(params['id'], params['id2'],
                {
                    limit: limit
                });
            })
            .subscribe((tracklist: SpotifyTracklist) => {
                this.spotifyTracks  = [];

                this.spotifyTracks = this.spotifyTracks.concat(tracklist.items.filter(tra => !tra.is_local && tra.track));
                this.selectCurrentTrack(this.playerService.track);
                const total = tracklist.total;
                let offset = tracklist.offset;
                this.numberOfParts = 0;
                this.numberOfLoadedParts = 0;
                if (total < limit + offset) {
                    setTimeout(() => this.loadingService.setLoading(false));
                }
                while (total > limit + offset) {
                    ++this.numberOfParts;
                    this.route.params
                    .switchMap((params: Params) => this.spotifyService.getPlaylistTracks(params['id'], params['id2'],
                        {
                            limit: limit,
                            offset: offset + limit
                        }))
                    .subscribe((innerResult: SpotifyTracklist) => {
                        ++this.numberOfLoadedParts;
                        this.spotifyTracks = this.spotifyTracks.concat(innerResult.items.filter(tra => !tra.is_local && tra.track));
                        this.selectCurrentTrack(this.playerService.track);
                        // console.log("parts : "+this.numberOfParts + "   Loads : "+this.numberOfLoadedParts);
                        this.loadingService.setLoading(false);
                        /*if(this.numberOfParts <= this.numberOfLoadedParts)
                        {
                            this.loadingService.setLoading(false);
                        }*/
                    }, error => {
                        this.loadingService.setLoading(false);
                    });
                    offset += limit;
                }
            }, error => {
                this.loadingService.setLoading(false);
            });
        this.route.params
            .switchMap((params: Params) => this.spotifyService.getPlaylistInfo(params['id'], params['id2']))
            .subscribe((playlistInfo: SpotifyPlaylistInfo) => {
                this.playlistInfo = playlistInfo;
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
     selectCurrentTrack(track: Track) {
        const temptrack = this.spotifyTracks.find(x => x.track.uri === track.Address);
        if (this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tempPlaylistId)) {
            if (temptrack) {
                this.selectedTrack = temptrack.track;
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
        this.loadingService.setLoading(true);
        const trackList: Track[] = [];
        this.spotifyTracks.forEach(st => {

            const newTrack: Track = new Track();
            newTrack.Address = st.track.uri;
            newTrack.Name = st.track.artists[0].name + ' - ' + st.track.name;
            newTrack.Type = 2;
            newTrack.Playlist = playlist;
            trackList.push(newTrack);
        });
        this.trackService.createMany(trackList).then(ret => {
            this.loadingService.setLoading(false);
        })
        .catch(err => {
            this.loadingService.setLoading(false);
        });
     }
    onSpotifySelect(track: SpotifyTrack) {
        const trackList: Track[] = [];
        let order = 0;
        const newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempPlaylistId;
        newPlaylist.Name = 'Spotify : ' + this.playlistInfo.name;
        this.spotifyTracks.forEach(st => {

            const newTrack: Track = new Track();
            newTrack.Address = st.track.uri;
            newTrack.Name = st.track.artists[0].name + ' - ' + st.track.name;
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
