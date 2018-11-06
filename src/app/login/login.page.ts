import {User} from './../models/user';
import {Component} from '@angular/core';
import {NavController, AlertController} from '@ionic/angular';
import {AngularFireAuth} from 'angularfire2/auth';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {

    message;

    user = {} as User;

    constructor(private fireAuth: AngularFireAuth, private alert: AlertController, public navCtrl: NavController, ) {
    }

    async login(user: User) {
        this.fireAuth.auth.signInWithEmailAndPassword(user.email, user.password)
            .then(
                () => this.navCtrl.navigateForward('home'),
                error => this.message = error.message
            );
    }


    register() {

        // push --> reg page

        this.navCtrl.navigateForward('register');
    }
    skip() {
        this.navCtrl.navigateForward('home');
    }

}

