import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {IonicModule, IonicRouteStrategy, ModalController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import { ModalComponent } from './modal/modal.component';
import {FormsModule} from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AuthService } from './core/auth.service';
import {CoreModule} from './core/core.module';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import {environment} from '../environments/environment';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { CertificateCardComponent } from './certificate-card/certificate-card.component';


export const firebaseConfig = environment.firebaseConfig;

@NgModule({
    declarations: [AppComponent, ModalComponent, CertificateCardComponent],
    entryComponents: [ModalComponent, CertificateCardComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        AngularFireAuthModule,
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireStorageModule,
        AngularFirestoreModule,
        AngularFireDatabaseModule,
        CoreModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        AuthService,
        Facebook,
        GooglePlus,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
