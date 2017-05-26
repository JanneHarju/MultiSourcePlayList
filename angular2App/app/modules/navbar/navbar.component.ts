import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { SpotifyUser } from '../../models/spotifyUser';
import { UserInfo } from '../../models/userInfo';

@Component({
    selector: 'my-navbar',
    templateUrl: 'navbar.component.html',
    styles: [ require('./navbar.component.less') ]
})

export class NavbarComponent implements OnInit {
    subscriptionSpotifyAuthenticationComplited : Subscription;
    subscriptionAppAuthenticationComplited : Subscription;
    currentSpotifyUser: SpotifyUser = new SpotifyUser();
    userName: string = "";
    constructor(
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private router: Router) { }

    ngOnInit() 
    {
        this.subscriptionSpotifyAuthenticationComplited = this.spotifyService.getAuthenticationComplited().subscribe(auth => 
        {
            this.spotifyService.getCurrentUser().subscribe(user => 
            {
                this.currentSpotifyUser = user;
            });
        });
        this.subscriptionAppAuthenticationComplited = this.authService.getAuthenticationComplited().subscribe(auth => 
        {
            if(auth)
            {
                this.getUserInfo();
            }
            else
            {
                this.userName = "";
            }
        });
        if(this.authService.checkLogin())
        {
            this.getUserInfo();
        }
        
    }
    getUserInfo()
    {
        this.authService.getUserInfo().then(res =>
        {
            console.log(res);
            var info = res.Data as UserInfo;
            if (res != null && info) {
                if (info && info.UserName) {
                    this.userName = info.UserName;
                }
                else
                {
                    this.userName = "";
                }
            }
        });
    }
    logout(){
        this.authService.setAuthenticationComplited(false);
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