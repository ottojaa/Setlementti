import { User } from './../models/user';
import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  user = {} as User;

  constructor(private fireAuth: AngularFireAuth, private alert: AlertController, public navCtrl: NavController, ) { }

  async login(user: User) {

    try {

      const info = this.fireAuth.auth.signInWithEmailAndPassword(user.email, user.password);

      if (info) {
        // Push --> Login page

        await this.navCtrl.navigateForward('list');
      }

    } catch (e) {

      console.error(e);

    }

  }


  register() {

    // push --> reg page

    this.navCtrl.navigateForward('register');
  }

}

