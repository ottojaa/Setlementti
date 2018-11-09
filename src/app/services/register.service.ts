import { Injectable } from '@angular/core';
import {Component} from '@angular/core';
import {NavController, NavParams} from '@ionic/angular';
import {User} from '../models/user';
import * as firebase from 'firebase/app';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Router} from '@angular/router';
import { of } from 'rxjs';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

interface UserDetails {
    uid: string;
    email: string;
    photoURL: string;
    description?: string;
}


@Injectable({
  providedIn: 'root'
})

export class RegisterService {

    message;
    user: Observable<UserDetails>;

    constructor(private afAuth: AngularFireAuth,
                public navCtrl: NavController,
                private afs: AngularFirestore,
                private router: Router,
                ) {

        this.user = this.afAuth.authState
            .switchMap(user => {
                if (user) {
                    // logged in, get custom user from Firestore
                    return this.afs.doc<UserDetails>(`users/${user.uid}`).valueChanges();
                } else {
                    // logged out, null
                    return of(null);
                }
            });
    }
    updateUser(user: UserDetails, data: any) {
        return this.afs.doc(`users/${user.uid}`).update(data);
    }

    async register(email: string, password: string) {
        this.afAuth.auth.createUserWithEmailAndPassword(email, password)
            .then(
                () => this.setUserDoc(this.user),
                error => console.log(this.user)
            );
    }

    private setUserDoc(user) {

        const userRef: AngularFirestoreDocument<UserDetails> = this.afs.doc(`users/${user.uid}`);

        const data: UserDetails = {
            uid: user.uid,
            email: user.email || null,
            photoURL: 'https://i.redd.it/coiddgklw4301.jpg'
        };
        this.navCtrl.navigateForward('login');
        return userRef.set(data);

    }

    goBack() {
        this.navCtrl.navigateBack('login');
    }
}
