import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireStorage} from 'angularfire2/storage';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {AlertController, LoadingController} from '@ionic/angular';
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
    photoURL: any;
    age: any;
    mentor: boolean;
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
    profilePicture;
    lastURL;
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
                private cdRef: ChangeDetectorRef,
                private alertController: AlertController) {
    }

    toggleReadOnly() {
        this.editProfile = this.editProfile === 'out' ? 'in' : 'out';
        this.editMode = !this.editMode;
        this.isReadOnly = !this.isReadOnly;
        console.log(this.isReadOnly);
    }

    defineUpload(event) {
        this.inputField = false;
        console.log(this.imageURL);
        this.file = event.target.files[0];
        const img = document.getElementById('profilepic');
        img.setAttribute('src', URL.createObjectURL(this.file));
        console.log(this.file);
        this.uploadTrue = true;
    }

    upload() {
        this.storage.upload(`users/${this.data.user.uid}/profilePic.jpg`, this.file);
        this.presentLoading();
        setTimeout(() => {
            this.setReference();
            this.showAlert();
        }, 4000);
        this.uploadTrue = false;
        this.enableInput();
    }

    enableInput() {
        setTimeout(() => {
            this.inputField = true;
        }, 500);
    }

    cancel() {
        const img = document.getElementById('profilepic');
        img.setAttribute('src', this.data.user.photoURL);
        console.log(this.imageURL);
        this.uploadTrue = false;
        this.enableInput();
    }
    async presentLoading() {
        const loading = await this.loadingController.create({
            spinner: 'crescent',
            duration: 3000,
        });
        return await loading.present();
    }
    async showAlert() {

        const alert = await this.alertController.create({
            message: 'Updated succesfully!'
        });
        await alert.present();
        setTimeout(() => {
            alert.dismiss();
        }, 2000);
    }

    async setReference() {
        if (this.storage.ref(`users/${this.data.user.uid}/profilePic.jpg`)) {
            this.downloadURL = this.storage.ref(`users/${this.data.user.uid}/profilePic.jpg`).getDownloadURL().subscribe(url => {
                if (url) {
                    console.log('aseta uusi imageurli');
                    this.imageURL = url;
                    this.data.user.photoURL = url;
                    this.lastURL = this.imageURL;
                    console.log(this.imageURL);
                    this.setProfilePicURL();
                }
            });
        }
        this.cdRef.detectChanges();
    }

    async setProfilePicURL() {
        const pictureRef = this.afs.collection('users').doc(this.data.user.uid);
        return pictureRef.update({photoURL: this.imageURL});
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
            photoURL: user.photoURL,
            nickName: this.nickName,
            description: this.description,
            birthdate: new Date(this.dob).getTime(),
            age: this.realAge,
            mentor: false
        };
        console.log(data.age);
        this.toggleReadOnly();
        return userRef.set(data, {merge: true});
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
        console.log(this.dob);
    }

}
