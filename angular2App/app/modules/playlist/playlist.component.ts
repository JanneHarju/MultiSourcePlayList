import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PlaylistService} from '../../services/playlist.service';
import { SpotifyService } from '../../services/spotify.service';
import { Playlist } from '../../models/playlist'
import { SpotifyPlaylist } from '../../models/spotifyplaylist';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'my-playlist',
    templateUrl: 'playlist.component.html',
    styles: [ require('./playlist.component.less') ]
})

export class PlaylistComponent implements OnInit {
    constructor(
        private playlistService: PlaylistService,
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private router: Router) { }
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
                    .subscribe((playlists : SpotifyPlaylist[])=> this.spotifyplaylists = playlists);
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
    getPlaylists(): void {
        this.playlistService.getUsersPlaylists()
            .then((playlists : Playlist[])=> 
            {
                this.playlists = playlists;
                console.log(playlists);
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
        this.spotifyService.getUsersPlaylist()
                .subscribe((playlists : SpotifyPlaylist[])=> this.spotifyplaylists = playlists);
    }
    add(name: string): void {
        name = name.trim();
        if (!name) { return; }
        this.playlistService.create(name)
            .then((playlist : Playlist) => {
            this.playlists.push(playlist);
            this.getPlaylists();
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
        });
    }
    setRenameTarget(playlist: Playlist)
    {
        this.renametarget = playlist;
    }
    rename(newName: string)
    {
        this.renametarget.Name = newName;
        this.playlistService.update(this.renametarget).then(plaa =>
        {
        });
    }
    setShuffleTarget(playlist: Playlist)
    {
        this.shuffletarget = playlist;
    }
    shuffle()
    {
        this.playlistService.shuffle(this.shuffletarget).then(plaa =>
        {
            this.router.navigate(['/main/tracklist', this.shuffletarget.Id]);
        });
    }
}