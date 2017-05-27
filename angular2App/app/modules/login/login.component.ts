import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from "../../services/auth.service";
import { User } from '../../models/user';

@Component({
    selector: "my-login",
    templateUrl: 'login.component.html',
    styles: [ require('./login.component.less') ]
})

export class LoginComponent implements OnInit {

    private loginUser: User;
    private register: boolean;
    //private postStream: Subscription;

    constructor(
        private authService: AuthService,
        private router: Router) 
    { }
    ngOnInit()
    {
        this.loginUser = new User();
        this.register = false;
    }
    login() {
        this.authService.login(this.loginUser).then(
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
        this.authService.register(this.loginUser).then(
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