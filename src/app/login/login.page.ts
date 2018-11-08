import {User} from './../models/user';
import {Component} from '@angular/core';
import {NavController, AlertController, Platform} from '@ionic/angular';
import {AngularFireAuth} from 'angularfire2/auth';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

import * as firebase from 'firebase/app';


@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {

    message;

    user = {} as User;

    constructor(private fireAuth: AngularFireAuth, private platform: Platform, private gplus: GooglePlus, public facebook: Facebook,
        private alert: AlertController, public navCtrl: NavController) {
    }

    async login(user: User) {
        this.fireAuth.auth.signInWithEmailAndPassword(user.email, user.password)
            .then(
                () => this.navCtrl.navigateForward('home'),
                error => this.message = error.message
            );
    }
    // -------------------------------Facebook Login------------------------------

  async nativeFacebookLogin(): Promise<any> {
    return this.facebook.login(['email'])
      .then(response => {
        const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(response.authResponse.accessToken);

        firebase.auth().signInWithCredential(facebookCredential)
          .then(success => {
            console.log('Firebase success: ' + JSON.stringify(success));
            this.navCtrl.navigateForward('home');
          });

      }).catch((error) => {
        console.log(error);
      });
  }


  async webFacebookLogin(): Promise<void> {
    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      const credential = await this.fireAuth.auth.signInWithPopup(provider);

      await this.navCtrl.navigateForward('home');

    } catch (error) {
      console.log(error);
    }
  }

  facebookLogin() {
    if (this.platform.is('cordova')) {
      this.nativeFacebookLogin();
    } else {
      this.webFacebookLogin();
    }
  }
  signOutFb() {
    this.fireAuth.auth.signOut();
  }

    // -----------------------------------Google login---------------------------------

  async nativeGoogleLogin(): Promise<firebase.User> {
    try {

      const gplusUser = await this.gplus.login({
        'webClientId': '781161234617-b8h67899fh3k3kg8evuak7of1q62v1jb.apps.googleusercontent.com',
        'offline': true,
        'scopes': 'profile email'
      });
      await this.navCtrl.navigateForward('home');
      return await this.fireAuth.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken));

    } catch (error) {
      console.log(error);
    }
  }

  async webGoogleLogin(): Promise<void> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const credential = await this.fireAuth.auth.signInWithPopup(provider);
      await this.navCtrl.navigateForward('home');

    } catch (error) {
      console.log(error);
    }
  }

  googleLogin() {
    if (this.platform.is('cordova')) {
      this.nativeGoogleLogin();
    } else {
      this.webGoogleLogin();
    }
  }
  signOutGl() {
    this.fireAuth.auth.signOut();
  }


    register() {

        // push --> reg page

        this.navCtrl.navigateForward('register');
    }
    skip() {
        this.navCtrl.navigateForward('home');
    }

}

