import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy, ModalController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import { ModalComponent } from './modal/modal.component';
import {FormsModule} from '@angular/forms';

@NgModule({
    declarations: [AppComponent, ModalComponent],
    entryComponents: [ModalComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        FormsModule,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
