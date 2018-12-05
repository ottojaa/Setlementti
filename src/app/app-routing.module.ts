import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {
        path: 'login',
        loadChildren: './login/login.module#LoginPageModule'
    },
    {
        path: 'register',
        loadChildren: './register/register.module#RegisterPageModule'
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadChildren: './home/home.module#HomePageModule'
    },
    {
        path: 'list',
        loadChildren: './list/list.module#ListPageModule'
    },
    {
        path: 'profile',
        loadChildren: './profile/profile.module#ProfilePageModule'
    },  { path: 'CV', loadChildren: './cv/cv.module#CVPageModule' },
  { path: 'client-profile', loadChildren: './client-profile/client-profile.module#ClientProfilePageModule' },
  { path: 'mentor-card', loadChildren: './mentor-card/mentor-card.module#MentorCardPageModule' },


];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
