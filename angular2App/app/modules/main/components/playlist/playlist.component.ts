import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PlaylistService} from '../../../../services/playlist.service';
import { SpotifyService } from '../../../../services/spotify.service';
import { Playlist } from '../../../../models/playlist'
import { SpotifyPlaylist } from '../../../../models/spotifyplaylist';
import { AuthService } from '../../../../services/auth.service';
import { LoadingService }         from '../../../../services/loading.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'my-playlist',
    templateUrl: 'playlist.component.html',
    styleUrls: [ './playlist.component.css' ]
})

export class PlaylistComponent implements OnInit, OnDestroy {
    constructor(
        private playlistService: PlaylistService,
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private router: Router,
        private loadingService: LoadingService)
    { }

    playlists: Playlist[] = [];
    spotifyplaylists: SpotifyPlaylist[] = [];
    selectedPlaylist: Playlist = new Playlist();
    renametarget : Playlist = new Playlist();
    removetarget : Playlist = new Playlist();
    shuffletarget : Playlist = new Playlist();
    subscriptionAuthenticationComplited : Subscription;
    subscriptionAppAuthenticationComplited : Subscription;
    
    ngOnInit() 
    { 
        this.subscriptionAuthenticationComplited = this.spotifyService.getAuthenticationComplited().subscribe(auth => 
        {
            if(auth)
            {
                this.spotifyService.getUsersPlaylist()
                    .then((playlists : SpotifyPlaylist[])=> this.spotifyplaylists = playlists);
            }
        });
        this.subscriptionAppAuthenticationComplited = this.authService.getAuthenticationComplited().subscribe(auth => 
        {
            if(auth)
            {
                this.getPlaylists();
            }
            else
            {
                this.playlists = [];
            }
        });
        if(this.authService.checkLogin())
        {
            this.getPlaylists();
        }
    }
    ngOnDestroy(): void
    {
        this.subscriptionAppAuthenticationComplited.unsubscribe();
        this.subscriptionAuthenticationComplited.unsubscribe();
    }
    getPlaylists(): void {
        
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
        /*this.spotifyService.getUsersPlaylist()
                .then((playlists : SpotifyPlaylist[])=> this.spotifyplaylists = playlists);*/
    }
    add(name: string): void {
        this.loadingService.setLoading(true);
        name = name.trim();
        if (!name) { return; }
        this.playlistService.create(name)
            .then((playlist : Playlist) => {
                this.playlists.push(playlist);
                this.getPlaylists();

                this.loadingService.setLoading(false);
            }).catch(err=>
            {
                this.loadingService.setLoading(false);
            });
    }
    selectPlaylist(playlist: Playlist)
    {
        this.selectedPlaylist = playlist;
    }
    setDeleteTarget(playlist: Playlist)
    {
        this.removetarget = playlist;
    }
    delete()
    {

        this.loadingService.setLoading(true);
        this.playlistService.delete(this.removetarget.Id).then(result =>
        {
            if(this.selectedPlaylist.Id == this.removetarget.Id)
            {
                let selectedPlaylist = this.playlists.find(x=>x.Order>this.removetarget.Order);
                if(!selectedPlaylist)
                {
                    selectedPlaylist = this.playlists.find(x=>x.Order<this.removetarget.Order);
                }
                this.router.navigate(['/main/tracklist', selectedPlaylist.Id]);
            }
            this.playlists.splice(this.playlists.findIndex(pl=>pl.Id == this.removetarget.Id),1);
            this.loadingService.setLoading(false);
        }).catch(err=>
        {
            this.loadingService.setLoading(false);
        });
    }
    setRenameTarget(playlist: Playlist)
    {
        this.renametarget = playlist;
    }
    rename(newName: string)
    {

        this.loadingService.setLoading(true);
        this.renametarget.Name = newName;
        this.playlistService.update(this.renametarget).then(plaa =>
        {
            this.loadingService.setLoading(false);
        })
        .catch(err=>
        {
            this.loadingService.setLoading(false);
        });
    }
    setShuffleTarget(playlist: Playlist)
    {
        this.shuffletarget = playlist;
    }
    shuffle()
    {
        this.loadingService.setLoading(true);
        this.playlistService.shuffle(this.shuffletarget).then(plaa =>
        {
            this.router.navigate(['/main/tracklist', this.shuffletarget.Id]);
            this.loadingService.setLoading(false);
        })
        .catch(err=>
        {
            this.loadingService.setLoading(false);
        });
    }
}