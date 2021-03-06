import { Component, OnInit } from '@angular/core';
import { UserInfo } from '../../../../models/userInfo';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'my-userinfo',
    templateUrl: 'userInfo.component.html',
    styleUrls: [ './userInfo.component.css' ],
})
export class UserInfoComponent implements OnInit {
    userInfo: UserInfo = new UserInfo();
    disckUsageProcent = 0.0;
    constructor(
        private authService: AuthService,
        private router: Router) { }

    ngOnInit() {
        this.getUserInfo();
    }

    getUserInfo() {
        this.authService.getUserInfo().then(res => {
            const info = res.Data as UserInfo;
            this.userInfo = info;
            this.disckUsageProcent = (this.userInfo.UsedDiscSpace / this.userInfo.MaxDiscSpace) * 100;
        })
        .catch(err => {
            if (err.status === 401) {
                this.authService.clearLoginToken();
                this.router.navigate(['/login']);
            }
        });
    }
}
