import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './modules/login/login.component';
import { AuthService} from './services/auth.service';
import { CallbackComponent } from './modules/callback/callback.component';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login',  component: LoginComponent },
    { path: 'callback',  component: CallbackComponent },
    { path: 'main',  loadChildren: './modules/main/main.module#MainModule', canActivate: [ AuthService] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
