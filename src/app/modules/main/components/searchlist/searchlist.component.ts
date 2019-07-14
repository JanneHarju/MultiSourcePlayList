import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SpotifyService } from '../../../../services/spotify.service';
import { YoutubeAPIService } from '../../../../services/youtubeapi.service';
import { SpotifyTrack } from '../../../../models/spotifytrack';
import { YoutubeVideo } from '../../../../models/youtubeVideo';
import { PlaylistService} from '../../../../services/playlist.service';
import { AuthService } from '../../../../services/auth.service';
import { Playlist } from '../../../../models/playlist';
import { Track } from '../../../../models/track';
import { TrackService } from '../../../../services/track.service';
import { PlayerService } from '../../../../services/player.service';
import { BandcampService, BandcampOptions } from '../../../..//services/bandcamp.service';
import { LoadingService } from '../../../../services/loading.service';
import { SearchResult, Artist, Album, BandCampTrack, Fan, Label } from '../../../../json_schema/SearchResult';
import { Subscription } from 'rxjs/Subscription';


@Component({
    selector: 'my-searchlist',
    templateUrl: 'searchlist.component.html',
    styleUrls: [ './searchlist.component.css' ],
})

export class SearchlistComponent implements OnInit, OnDestroy {
    spotifyTracks: SpotifyTrack[] = [];
    youtubeVideos: YoutubeVideo[] = [];
    musipleTracks: Track[] = [];
    bandcampArtists: Artist[] = [];
    bandcampAlbums: Album[] = [];
    bandcampTracks: BandCampTrack[] = [];
    playlists: Playlist[] = [];
    query = '';
    selectedSpotifyTrack: SpotifyTrack = new SpotifyTrack();
    selectedYoutubeVideo: YoutubeVideo = new YoutubeVideo();
    selectedMusipleMp3: Track = new Track();
    subscriptionTrack: Subscription;
    subscriptionPlaylistsModified: Subscription;
    tempSpotifyPlaylistId = -4;
    tempYoutubePlaylistId = -5;
    searchSpotify: boolean = true;
    searchYoutube: boolean = true;
    searchBandcamp: boolean = false;
    searchMusipleMp3: boolean = true;

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

        this.route.params.subscribe((params: Params) => {

            this.query = params['id'];
            this.search();
        });

        this.subscriptionTrack = this.playerService.getTrack().subscribe(track => {
            this.selectCurrentTrack(track);
        });

        this.getUsersPlaylists();
        this.subscriptionPlaylistsModified = this.playlistService.getPlaylistsModified().subscribe(updated => {
            this.getUsersPlaylists();
        });
     }

    public search() {
        if (this.searchBandcamp || this.searchSpotify || this.searchYoutube || this.searchMusipleMp3) {
            this.loadingService.setLoading(true);
        }

        if (this.searchSpotify) {
            this.spotifyService.search(this.query, 'track')
                .then((tracklist: SpotifyTrack[]) => {
                    this.loadingService.setLoading(false);
                    this.spotifyTracks = tracklist;
                    this.selectCurrentTrack(this.playerService.track);
                });
        }
        else {
            this.spotifyTracks = [];
        }

        if (this.searchYoutube) {
            this.youtubeApiService.search(this.query)
                .subscribe((youtubeVideos: YoutubeVideo[]) => {
                    this.loadingService.setLoading(false);
                    this.youtubeVideos = youtubeVideos;
                    this.selectCurrentTrack(this.playerService.track);
                });
        }
        else {
            this.youtubeVideos = [];
        }

        if (this.searchMusipleMp3) {
            this.trackService.searchTracks(this.query)
                .then( tracks => {
                    this.loadingService.setLoading(false);
                    this.musipleTracks = tracks;
                    this.selectCurrentTrack(this.playerService.track);
                });
        } else {
            this.musipleTracks = [];
        }

        if (this.searchBandcamp) {
            this.bcsearch(this.query);
        }
        else {
            this.bandcampAlbums = [];
            this.bandcampArtists = [];
            this.bandcampTracks = [];
        }
    }

    ngOnDestroy(): void {
        this.subscriptionPlaylistsModified.unsubscribe();
        this.subscriptionTrack.unsubscribe();
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
    bcsearch(query: string) {
        const params: BandcampOptions = {
            q: query,
            page: 1
        };
        this.bandcampService.bandCampSearch(params)
        .then( (ret: SearchResult[]) => {
            this.bandcampAlbums = ret.filter(x => x.type === 'album') as Album[];
            this.bandcampArtists = ret.filter(x => x.type === 'artist') as Artist[];
            this.bandcampTracks = ret.filter(x => x.type === 'track') as BandCampTrack[];
            this.loadingService.setLoading(false);
        })
        .catch(err => {
            console.error(err);
            this.loadingService.setLoading(false);
        });
    }
    urlToBase64(url: string) {
        return btoa(url);
    }
    selectCurrentTrack(track: Track) {
        const temptrack = this.spotifyTracks.find(x => x.uri === track.Address);
        const tempvideo = this.youtubeVideos.find(x => x.id.videoId === track.Address);
        const musipletrack = this.musipleTracks.find(x => x.Address === track.Address);
        if (temptrack) {
            if (this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tempSpotifyPlaylistId)) {
                this.selectedSpotifyTrack = temptrack;
                this.selectedYoutubeVideo = null;
                this.selectedMusipleMp3 = null;
            }
        } else if(tempvideo) {
            if (this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(this.tempYoutubePlaylistId)) {
                this.selectedYoutubeVideo = tempvideo;
                this.selectedSpotifyTrack = null;
                this.selectedMusipleMp3 = null;
            }
        } else if(musipletrack){
            if(this.playerService.isCurrentlyPlayingTrackThisPlaylistTrack(musipletrack.Playlist.Id)) {
                this.selectedYoutubeVideo = null;
                this.selectedSpotifyTrack = null;
                this.selectedMusipleMp3 = musipletrack;
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
    addVideoToPlaylist(playlist: Playlist, video: YoutubeVideo) {
        this.loadingService.setLoading(true);
        const newTrack: Track = new Track();
        const trackList: Track[] = [];
        newTrack.Address = video.id.videoId;
        newTrack.Name = video.snippet.title;
        newTrack.Type = 1;
        newTrack.Playlist = playlist;
        trackList.push(newTrack);
        this.trackService.createMany(trackList).then(ret => {
            this.loadingService.setLoading(false);

        })
        .catch(err => {
            this.loadingService.setLoading(false);
        });
     }
     addMusipleMp3TrackToPlaylist(track: Track) {

        this.loadingService.setLoading(true);
        const trackList: Track[] = [];
        trackList.push(track);
        this.trackService.createMany(trackList).then(ret => {
            this.loadingService.setLoading(false);
        })
        .catch(err => {
            this.loadingService.setLoading(false);
        });
     }
     /*search(q: string): void {
        this.spotifyService.search(q,"track").subscribe(result =>
        {
        });
    }*/
    onSpotifySelect(track: SpotifyTrack) {
        const trackList: Track[] = [];
        let order = 0;
        const newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempSpotifyPlaylistId;
        newPlaylist.Name = 'Spotify Search : ' + this.query;
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
    onYoutubeSelect(video: YoutubeVideo) {
        const trackList: Track[] = [];
        let order = 0;
        const newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempYoutubePlaylistId;
        newPlaylist.Name = 'Youtube Search : ' + this.query;
        this.youtubeVideos.forEach(ytv => {

            const newTrack: Track = new Track();
            newTrack.Address = ytv.id.videoId;
            newTrack.Id = 99999;
            newTrack.Name = ytv.snippet.title;
            newTrack.Type = 1;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = order;
            ++order;
            trackList.push(newTrack);
        });
        this.playerService.setTrackList(trackList);
        const tempTrack = trackList.find(tr => tr.Address === video.id.videoId);
        this.playerService.setTrack(tempTrack);
    }
    onMusipleSelect(track: Track) {
        this.selectedMusipleMp3 = track;
        this.playerService.setTrackList(this.musipleTracks);
        this.playerService.setTrack(track);
    }
    addSpotifyToQueue(track: SpotifyTrack) {
        const newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempSpotifyPlaylistId;
        newPlaylist.Name = 'Spotify Search : ' + this.query;
        const newTrack: Track = new Track();
            newTrack.Address = track.uri;
            newTrack.Name = track.artists[0].name + ' - ' + track.name;
            newTrack.Type = 2;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = 0;
        this.playerService.addTrackToQueue(newTrack);
    }
    addYoutubeToQueue(video: YoutubeVideo) {
        const newPlaylist: Playlist = new Playlist();
        newPlaylist.Id = this.tempSpotifyPlaylistId;
        newPlaylist.Name = 'YouTube Search : ' + this.query;
        const newTrack: Track = new Track();
            newTrack.Address = video.id.videoId;
            newTrack.Name = video.snippet.title;
            newTrack.Id = 99999;
            newTrack.Type = 1;
            newTrack.Playlist = newPlaylist;
            newTrack.Order = 0;
        this.playerService.addTrackToQueue(newTrack);
    }
    addMusipleMp3ToQueue(track: Track) {
        this.playerService.addTrackToQueue(track);
    }
    getTrackName(name: string) {
        const nameParts = name.split(' - ');
        nameParts.shift();
        return nameParts.join(' - ');
    }
}
