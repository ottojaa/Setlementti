import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireStorage} from 'angularfire2/storage';
import {AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import {AlertController, NavController, LoadingController} from '@ionic/angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import {DataService} from '../services/data.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ModalController} from '@ionic/angular';
import {CertificateCardComponent} from '../certificate-card/certificate-card.component';
import {MentorCardComponent} from '../mentor-card/mentor-card.component';

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

interface CV {
    date: any;
    owner: string;
    CVid: string;
    certificates: {};
}

interface Certificate {
    author: string;
    date: string;
    files: [];
    text: string;
    title: string;
    downloadURLs: [];
    cid: string;
}

@Component({
    selector: 'app-client-profile',
    templateUrl: './client-profile.page.html',
    styleUrls: ['./client-profile.page.scss'],
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
export class ClientProfilePage implements OnInit {
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
    certificates: any;
    user: Observable<User>;
    certificatesCol: AngularFirestoreCollection<Certificate>;
    cvPermission: boolean;
    sharedCV;

    constructor(private afAuth: AngularFireAuth,
                private afs: AngularFirestore,
                private router: Router,
                private data: DataService,
                private storage: AngularFireStorage,
                public loadingController: LoadingController,
                private cdRef: ChangeDetectorRef,
                private alertController: AlertController,
                public modalController: ModalController,
                public navCtrl: NavController,) {
    }

    async presentLoading() {
        const loading = await this.loadingController.create({
            spinner: 'crescent',
            duration: 3000,
        });
        return await loading.present();
    }

    getCertificates() {
        // Uploadattujen modaalien data
        // Media näkyy toimivassa versiossa vain niillä, jotka upattu 14.11. jälkeisen päivityksen jälkeen
        this.certificates = this.certificatesCol.snapshotChanges().map(actions => {
            return actions.map(a => {
                const data = a.payload.doc.data() as Certificate;
                const id = a.payload.doc.id;
                return {id, data};
            });
        });
    }

// asiakkaan Cardkomponentti placeholderina
    async presentCertificate(id) {
        this.data.clientCertificate = {};
        this.data.clientCertificate.id = id;
        localStorage.setItem('cid', id);
        const modal = await this.modalController.create({
            component: MentorCardComponent,
            componentProps: {value: 123}
        });
        return await modal.present();
    }

    presentCV() {
        // userid localstorageen, jotta muidenkin olisi mahdollista mahdollisesti tarkastella kyseistä CV:tä
        console.log(this.data.client);
        localStorage.setItem('owner', JSON.stringify(this.data.client));
        localStorage.setItem('CVid', this.data.client.CV);
        console.log(this.data.client.CV);
        this.navCtrl.navigateForward('CV');
    }

    checkCV() {
        if (this.sharedCV.length > 0) {
            this.cvPermission = true;
        } else {
            this.cvPermission = false;
        }
    }

    ngOnInit() {
        const cv = this.afs.collection('CVs', ref => ref.where('owner', '==', this.data.client.uid)
            .where('sharedTo', 'array-contains', this.data.user.uid)).valueChanges();
        cv.subscribe((data) => {
            this.sharedCV = data;
            console.log(this.sharedCV);
            this.checkCV();
        });
        this.certificatesCol = this.afs.collection('certificates', ref => ref.where('author', '==', this.data.client.uid)
            .where('sharedTo', 'array-contains', this.data.user.uid));
        this.editProfile = 'out';
        this.getCertificates();
        console.log(this.data.client);
    }

}

