import { Component, OnInit } from '@angular/core';
import { UserInfo } from '../../models/userInfo';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'my-userinfo',
    templateUrl: 'userinfo.component.html',
    styleUrls: [ './userinfo.component.less' ],
})

export class UserInfoComponent implements OnInit {
    userInfo: UserInfo = new UserInfo();
    constructor(
        private authService: AuthService,
        private router: Router)
    { }

    ngOnInit() 
    {
        this.getUserInfo();
    }

    getUserInfo()
    {
        this.authService.getUserInfo().then(res =>
        {
            var info = res.Data as UserInfo;
            this.userInfo = info;
        })
        .catch(err=>
        {
            if(err.status == 401)
            {
                this.authService.clearLoginToken();
                this.router.navigate(["login"]);
            }
        });
    }
}