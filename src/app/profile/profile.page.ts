import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireStorage} from 'angularfire2/storage';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {LoadingController} from '@ionic/angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import {DataService} from '../services/data.service';
import {Upload} from './upload';
import {animate, state, style, transition, trigger} from '@angular/animations';

interface User {
    uid: string;
    email: string;
    description?: string;
    nickName: string;
    birthdate: any;
    age: any;
}

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: [
        trigger('slideInOut', [
            state('in', style({
                overflow: 'hidden',
                height: '*',
                width: '100%'
            })),
            state('out', style({
                opacity: '0',
                overflow: 'hidden',
                height: '0px',
                width: '0px'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ])
    ],
})
export class ProfilePage implements OnInit {
    dob;
    description;
    nickName;
    realAge;
    editMode = false;
    isReadOnly = true;
    file;
    downloadURL;
    imageURL;
    previewURL;
    previkkaURL;
    editProfile;
    uploadTrue = false;
    inputField = true;

    user: Observable<User>;

    constructor(private afAuth: AngularFireAuth,
                private afs: AngularFirestore,
                private router: Router,
                private data: DataService,
                private storage: AngularFireStorage,
                public loadingController: LoadingController,
                private cdRef: ChangeDetectorRef) {
    }

    toggleReadOnly() {
        this.editProfile = this.editProfile === 'out' ? 'in' : 'out';
        this.editMode = !this.editMode;
        this.isReadOnly = !this.isReadOnly;
        console.log(this.isReadOnly);
    }

    defineUpload(event) {
        this.inputField = false;
        console.log(this.previewURL);
        this.file = event.target.files[0];
        this.storage.upload(`users/${this.data.user.uid}/previewPic`, this.file);
        setTimeout(() => {
            this.setPreviewReference();
        }, 2000);
        console.log(this.file);
        this.uploadTrue = true;
    }

    upload() {
        this.storage.upload(`users/${this.data.user.uid}/profilePic`, this.file);
        setTimeout(() => {
            this.setReference();
        }, 400);
        this.uploadTrue = false;
        this.enableInput();
    }

    enableInput() {
        setTimeout(() => {
            this.inputField = true;
        }, 500);
    }

    cancel() {
        this.previewURL = null;
        this.uploadTrue = false;
        this.enableInput();
    }

    async setReference() {
        if (this.storage.ref(`users/${this.data.user.uid}/profilePic`)) {
            this.downloadURL = this.storage.ref(`users/${this.data.user.uid}/profilePic`).getDownloadURL().subscribe(url => {
                if (url) {
                    this.imageURL = url;
                    console.log(this.imageURL);
                }
            });
        }
        this.cdRef.detectChanges();
    }

    async setPreviewReference() {
        if (this.storage.ref(`users/${this.data.user.uid}/previewPic`)) {
            this.previkkaURL = this.storage.ref(`users/${this.data.user.uid}/previewPic`).getDownloadURL().subscribe(url => {
                if (url) {
                    this.previewURL = url;
                    console.log(this.previewURL);
                }
            });
        }
        this.cdRef.detectChanges();
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
            nickName: this.nickName,
            description: this.description,
            birthdate: new Date(this.dob).getTime(),
            age: this.realAge
        };
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
        if (this.data.user.description) {
            this.description = this.data.user.description;
        }
        if (this.data.user.nickName) {
            this.nickName = this.data.user.nickName;
        }
        if (this.data.user.birthdate) {
            this.dob = new Date(this.data.user.birthdate).toISOString();
        }
        this.editProfile = 'out';
        this.setReference();
        console.log(this.dob);
    }

}
