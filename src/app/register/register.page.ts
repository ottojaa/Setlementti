import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from '@ionic/angular';
import {User} from '../models/user';
import {AngularFireAuth} from 'angularfire2/auth';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

    message;

    user = {} as User;

    constructor(private fireAuth: AngularFireAuth, public navCtrl: NavController, ) {
    }
    async register(user: User) {
        this.fireAuth.auth.createUserWithEmailAndPassword(user.email, user.password)
            .then(
                () => this.navCtrl.navigateForward('login'),
                error => this.message = error.message
            );
    }

    goBack() {
        this.navCtrl.navigateBack('login');
    }
}
