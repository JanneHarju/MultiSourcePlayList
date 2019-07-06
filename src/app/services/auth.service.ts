import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/toPromise';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AuthService implements CanActivate {
    public tokeyKey = 'token';
    private BaseUrl = `${environment.backendUrl}/api/tokenauth`;  // URL to web api
    rememberme = false;
    private subjectAuthenticationComplited = new Subject<boolean>();
    constructor(private http: HttpClient, private router: Router) { }

    public canActivate() {
        if (this.checkLogin()) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
    public login(rememberme: boolean, user: User) {
        const header = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = { headers: header, withCredentials: true };
        this.rememberme = rememberme;
        return this.http.put<any>(`${this.BaseUrl}/Login/` + rememberme, user, options).toPromise().then(
            res => {
                const result = res;
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
        const header = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = { headers: header, withCredentials: true };
        this.rememberme = rememberme;

        return this.http.post<any>(`${this.BaseUrl}/Register/` + rememberme, user, options).toPromise().then(
            res => {
                const result = res;
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
        const options = { headers: headers };
        return this.http.get(url, options)
            .toPromise().then(
                response => response)
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
        localStorage.removeItem(this.tokeyKey);
    }
    public getUserInfo() {
        return this.authGet(this.BaseUrl);
    }

    public authPost$(url: string, body: any) {
        const headers = this.initAuthHeaders();
        return this.http.post(url, body, { headers: headers })
            .toPromise()
            .then(response => response)
            .catch(this.handleError);
    }

    public getLocalToken(): string {
           return sessionStorage.getItem(this.tokeyKey);
    }

    public initAuthHeaders(): HttpHeaders {
        const token = this.getLocalToken();
        if (token == null) {
            throw new Error('No token');
        }
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
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
