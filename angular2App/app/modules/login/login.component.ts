import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from "../../services/auth.service";
import { User } from '../../models/user';

@Component({
    selector: "my-login",
    templateUrl: 'login.component.html',
    styleUrls: [ './login.component.less' ]
})

export class LoginComponent implements OnInit {

    public loginUser: User;
    public register: boolean;
    rememberMe: boolean = false;
    //private postStream: Subscription;

    constructor(
        private authService: AuthService,
        private router: Router) 
    { }
    ngOnInit()
    {
        this.loginUser = new User();
        this.register = false;
        let longtermToken = localStorage.getItem(this.authService.tokeyKey)
        if(longtermToken)
        {
            sessionStorage.setItem(this.authService.tokeyKey, longtermToken);
            this.authService.getUserInfo().then(res =>
            {
                this.router.navigate(['main']);
            })
            .catch(err =>
            {
                this.authService.clearLoginToken();
                localStorage.removeItem(this.authService.tokeyKey);
            });

        }
    }
    login() {
        this.authService.login(this.rememberMe, this.loginUser).then(
            result => {
                if (result.State == 1) {
                    this.router.navigate(["/main"]);
                } else {
                    alert(result.Msg);
                }
            }
        )
    }
    registerUser()
    {
        this.authService.register(this.rememberMe, this.loginUser).then(
            result => {
                if (result.State == 1) {
                    this.router.navigate(["/main"]);
                } else {
                    alert(result.Msg);
                }
            }
        )
    }
    registerState()
    {
        this.register = true;
    }
    loginState()
    {
        this.register = false;
    }
}