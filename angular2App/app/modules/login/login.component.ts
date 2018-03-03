import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../services/auth.service';
import { SpotifyService } from '../../services/spotify.service';
import { User } from '../../models/user';

@Component({
    selector: 'my-login',
    templateUrl: 'login.component.html',
    styleUrls: [ './login.component.css' ]
})

export class LoginComponent implements OnInit {

    public loginUser: User;
    public register: boolean;
    rememberMe = false;
    //private postStream: Subscription;
    constructor(
        private authService: AuthService,
        private spotifyService: SpotifyService,
        private router: Router) { }
    ngOnInit() {
        this.loginUser = new User();
        this.register = false;
        let longtermToken = localStorage.getItem(this.authService.tokeyKey)
        if (longtermToken) {
            sessionStorage.setItem(this.authService.tokeyKey, longtermToken);
            this.authService.getUserInfo().then(res => {
                this.router.navigate(['/main']).then(navi => {
                    this.spotifyService.login(false).then(result => {
                    });
                });
            })
            .catch(err => {
                this.authService.clearLoginToken();
                localStorage.removeItem(this.authService.tokeyKey);
            });

        }
    }
    submit(loginForm: NgForm) {
        if (loginForm.valid) {
            if (this.register) {
                this.authService.register(this.rememberMe, this.loginUser).then(
                result => {
                    if (result.State == 1) {

                        this.router.navigate(['/main']).then(navi => {
                            this.spotifyService.login(false).then(result => {
                            });
                        });
                    } else {
                        alert(result.Msg);
                    }
                });
            } else {
                this.authService.login(this.rememberMe, this.loginUser).then(
                    result => {
                        if (result.State == 1) {
                            this.router.navigate(['/main']).then(navi => {
                                this.spotifyService.login(false).then(result => {
                                });
                            });


                        } else {
                            alert(result.Msg);
                        }
                    }
                );
            }
        }
    }
    registerState() {
        this.register = true;
    }
    loginState() {
        this.register = false;
    }
}