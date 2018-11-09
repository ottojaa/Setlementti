import {Component, OnInit} from '@angular/core';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import {DataService} from '../services/data.service';

interface User {
    uid: string;
    email: string;
    photoURL: string;
    description?: string;
    nickName: string;
}

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    description;
    nickName;
    test: any;

    userData: Observable<User>;

    user: Observable<User>;

    constructor(private afAuth: AngularFireAuth,
                private afs: AngularFirestore,
                private router: Router, private data: DataService) {
    }

    private createUserDoc(user) {

        const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

        const data: User = {
            uid: user.uid,
            email: user.email || null,
            photoURL: 'https://i.redd.it/coiddgklw4301.jpg',
            nickName: '',
            description: ''
        };
        console.log(user.uid);
        console.log(user.email);
        return userRef.set(data);

    }

    updateUserDoc(user) {
        const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
        userRef.ref.get().then((doc => {
            this.data.user = doc.data();
            console.log(this.data.user);
        }));
        if (this.nickName === undefined) {
            this.nickName = '';
        }
        if (this.description === undefined) {
            this.description = '';
        }

        const data: User = {
            uid: user.uid,
            email: user.email || null,
            photoURL: 'https://i.redd.it/coiddgklw4301.jpg',
            nickName: this.nickName,
            description: this.description
        };
        console.log(data.description);
        return userRef.set(data);
    }


    ngOnInit() {
        // -----jos käyttäjälle ei löydy dokumenttia firestoresta niin luo sellainen
        if (!this.afs.firestore.doc(`users/${this.data.user.uid}`)) {
            this.createUserDoc(this.data.user);
        }
    }

}
