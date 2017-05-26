import { Injectable } from "@angular/core";
import { Headers, Http, Response, RequestOptions } from "@angular/http";

import { Router, CanActivate } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';
import 'rxjs/add/operator/toPromise';
//import { RequestResult } from "./RequestResult";

@Injectable()
export class AuthService implements CanActivate {
    private tokeyKey = "token";

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

    public login(user: User) {
        let header = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: header });

        return this.http.put("/api/tokenauth/Login", user, options).toPromise().then(
            res => {
                let result = res.json();
                if (result.State == 1 && result.Data && result.Data.accessToken) {
                    sessionStorage.setItem(this.tokeyKey, result.Data.accessToken);
                    this.setAuthenticationComplited(true);
                }
                else
                {
                    this.setAuthenticationComplited(false);
                }
                return result;
            }
        ).catch(this.handleError);
    }

    public register(user: User) {
        let header = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: header });

        return this.http.post("/api/tokenauth/Register", user, options).toPromise().then(
            res => {
                let result = res.json();
                if (result.State == 1 && result.Data && result.Data.accessToken) {
                    sessionStorage.setItem(this.tokeyKey, result.Data.accessToken);
                    this.setAuthenticationComplited(true);
                }
                else
                {
                    this.setAuthenticationComplited(false);
                }
                return result;
            }
        ).catch(this.handleError);
    }

    public authGet(url: string) {
        let headers = this.initAuthHeaders();
        let options = new RequestOptions({ headers: headers });
        return this.http.get(url, options)
            .toPromise().then(
                response => response.json())
            .catch(this.handleError);
    }

    public setAuthenticationComplited(status: boolean)
    {
        this.subjectAuthenticationComplited.next(status);
    }
    public getAuthenticationComplited() : Observable<boolean>
    {
        return this.subjectAuthenticationComplited.asObservable();
    }

    public checkLogin(): boolean {
        let token = sessionStorage.getItem(this.tokeyKey);
        return token != null;
    }

    public getUserInfo() {
        return this.authGet("/api/tokenauth");
    }

    public authPost$(url: string, body: any) {
        let headers = this.initAuthHeaders();
        return this.http.post(url, body, { headers: headers })
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    private getLocalToken(): string {
           return sessionStorage.getItem(this.tokeyKey);
    }

    public initAuthHeaders(): Headers {
        let token = this.getLocalToken();
        if (token == null) throw "No token";

        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append("Authorization", "Bearer " + token);
        return headers;
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}