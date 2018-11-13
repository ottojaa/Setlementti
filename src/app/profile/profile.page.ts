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
    birthdate: any;
    age: any;
}

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    dob;
    description;
    nickName;
    realAge;
    editMode = false;
    isReadOnly = true;

    user: Observable<User>;

    constructor(private afAuth: AngularFireAuth,
                private afs: AngularFirestore,
                private router: Router, private data: DataService) {
    }

    toggleReadOnly() {
        this.editMode = !this.editMode;
        this.isReadOnly = !this.isReadOnly;
        console.log(this.isReadOnly);
    }

    updateUserDoc(user) {
        const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
        userRef.ref.get().then((doc => {
            this.data.user = doc.data();
            console.log(this.data.user);
        }));
        this.CalculateAge();
        const data: User = {
            uid: user.uid,
            email: user.email || null,
            photoURL: 'https://i.redd.it/coiddgklw4301.jpg',
            nickName: this.nickName,
            description: this.description,
            birthdate: new Date(this.dob).getTime(),
            age: this.realAge
        };
        console.log(data.description);
        console.log(data.age);
        this.toggleReadOnly();
        return userRef.set(data);
    }

    public CalculateAge(): void {
        console.log(this.dob);
        if (this.dob) {
            const timeDiff = Math.abs(Date.now() - new Date(this.dob).getTime());
            this.realAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
            console.log(this.realAge);
        }
    }


    ngOnInit() {
        this.description = this.data.user.description;
        this.nickName = this.data.user.nickName;
        this.dob = new Date(this.data.user.birthdate).toISOString();
        console.log(this.dob);
    }

}
