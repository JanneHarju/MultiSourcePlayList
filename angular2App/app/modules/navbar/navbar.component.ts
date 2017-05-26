import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { SpotifyUser } from '../../models/spotifyUser';

@Component({
    selector: 'my-navbar',
    templateUrl: 'navbar.component.html',
    styles: [ require('./navbar.component.less') ]
})

export class NavbarComponent implements OnInit {
    constructor(
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private router: Router) { }

    subscriptionAuthenticationComplited : Subscription;
    currentSpotifyUser: SpotifyUser = new SpotifyUser();
    userName: string = "";
    ngOnInit() 
    {
        this.subscriptionAuthenticationComplited = this.spotifyService.getAuthenticationComplited().subscribe(auth => 
        {
            this.spotifyService.getCurrentUser().subscribe(user => 
            {
                this.currentSpotifyUser = user;
            });
            this.authService.getUserInfo().then(res =>
            {
                console.log(res);
                if (res != null && res.Data) {
                    let thisuser = res.Data
                    if (thisuser && thisuser.UserName) {
                        this.userName = thisuser.UserName;
                    }
                }
            });
        });
        
    }
    logout(){
        sessionStorage.clear();
        this.router.navigate(["login"]);
    }
    loginToSpotify()
    {
        this.spotifyService.login(true).then(token => {
                console.log(token);
            });
        
    }
    
    search(q: string): void {
        //naigoidaan tässä
        this.router.navigate(['/searchlist', q]);
    }
}