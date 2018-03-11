import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Router, CanActivate } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AuthService implements CanActivate {
    public tokeyKey = 'token';
    private BaseUrl = 'http://musiple.azurewebsites.net/api/tokenauth';  // URL to web api
    rememberme = false;
    private subjectAuthenticationComplited = new Subject<boolean>();
    constructor(private http: Http, private router: Router) { }

    public canActivate() {
        if (this.checkLogin()) {
            return true;
        } else {
            this.router.navigate(['login']);
            return false;
        }
    }
    public login(rememberme: boolean, user: User) {
        const header = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: header, withCredentials: true });
        // let options = new RequestOptions({ headers: header });
        this.rememberme = rememberme;
        return this.http.put(`${this.BaseUrl}/Login/` + rememberme, user, options).toPromise().then(
            res => {
                const result = res.json();
                if (result.State === 1 && result.Data && result.Data.accessToken.Value) {
                    if (this.rememberme) {
                        localStorage.setItem(this.tokeyKey, result.Data.accessToken.Value);
                    }
                    sessionStorage.setItem(this.tokeyKey, result.Data.accessToken.Value);
                    this.setAuthenticationComplited(true);
                } else {
                    this.setAuthenticationComplited(false);
                }
                return result;
            }
        ).catch(this.handleError);
    }

    public register(rememberme: boolean, user: User) {
        const header = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: header });
        this.rememberme = rememberme;

        return this.http.post(`${this.BaseUrl}/Register/` + rememberme, user, options).toPromise().then(
            res => {
                const result = res.json();
                if (result.State === 1 && result.Data && result.Data.accessToken) {
                    if (this.rememberme) {
                        localStorage.setItem(this.tokeyKey, result.Data.accessToken);
                    }
                    sessionStorage.setItem(this.tokeyKey, result.Data.accessToken);
                    this.setAuthenticationComplited(true);
                } else {
                    this.setAuthenticationComplited(false);
                }
                return result;
            }
        ).catch(this.handleError);
    }

    public authGet(url: string) {
        const headers = this.initAuthHeaders();
        const options = new RequestOptions({ headers: headers });
        return this.http.get(url, options)
            .toPromise().then(
                response => response.json())
            .catch(this.handleError);
    }

    public setAuthenticationComplited(status: boolean) {
        this.subjectAuthenticationComplited.next(status);
    }
    public getAuthenticationComplited(): Observable<boolean> {
        return this.subjectAuthenticationComplited.asObservable();
    }

    public checkLogin(): boolean {
        const token = this.getLocalToken();
        return token != null;
    }
    public clearLoginToken() {
        sessionStorage.removeItem(this.tokeyKey);
    }
    public getUserInfo() {
        return this.authGet(this.BaseUrl);
    }

    public authPost$(url: string, body: any) {
        const headers = this.initAuthHeaders();
        return this.http.post(url, body, { headers: headers })
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    public getLocalToken(): string {
           return sessionStorage.getItem(this.tokeyKey);
    }

    public initAuthHeaders(): Headers {
        const token = this.getLocalToken();
        if (token == null) {
            throw new Error('No token');
        }
        const headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', 'Bearer ' + token);
        return headers;
    }

    private handleError(error: any) {
        console.error(error);
        if (error.status === 401) {
            this.clearLoginToken();
        }
        return Observable.throw(error);
    }
}
