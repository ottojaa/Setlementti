import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { User } from '../models/user';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

  user = {} as User;

  constructor(private fireAuth: AngularFireAuth, public navCtrl: NavController, ) { }

  async register(user: User) {

    try {

      const info = this.fireAuth.auth.createUserWithEmailAndPassword(user.email, user.password);

      if (info) {
        // Push --> Login page

        this.navCtrl.navigateForward('login');
      }

    } catch (e) {
      console.error(e);
    }

  }
}
