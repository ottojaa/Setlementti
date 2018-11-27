import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ModalComponent} from '../modal/modal.component';
import {CertificateCardComponent} from '../certificate-card/certificate-card.component';
import {DataService} from '../services/data.service';
import {AngularFireAuth} from 'angularfire2/auth';
import {FormsModule} from '@angular/forms';
import {NavController, AlertController} from '@ionic/angular';
import {AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import 'firebase/firestore';
import {combineLatest} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import * as firebase from 'firebase';
import {Observable} from 'rxjs';
import 'rxjs/Rx';
import {animate, state, style, transition, trigger} from '@angular/animations';

interface User {
    uid: string;
    email: string;
    photoURL: string;
    description?: string;
    nickName: string;
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

interface File {
    path: string;
    size: string;
    sender: string;
    downloadURL: string;

}

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    animations: [
        trigger('slideInOut', [
            state('in', style({
                overflow: 'hidden',
                height: '*',
                width: '*'
            })),
            state('out', style({
                overflow: 'hidden',
                height: '0',
                width: '*'
            })),
            transition('in => out', animate('200ms ease-out')),
            transition('out => in', animate('200ms ease-out'))
        ])
    ]
})
export class HomePage implements OnInit {
    private params = {};
    title;
    inputTrue = false;
    certificatesCol: AngularFirestoreCollection<Certificate>;
    fileDoc: AngularFirestoreDocument<File>;
    certificates: any;
    users;
    identifier;
    searchTrue;
    selection;
    selectTrue;

    constructor(private fireAuth: AngularFireAuth, public modalController: ModalController,
                public data: DataService, public navCtrl: NavController, private afs: AngularFirestore, private db: AngularFirestore) {

    }

    search($event) {
        this.identifier = 'in';
        this.data.searchterm = $event.target.value;

        if (this.data.searchterm !== '') {
            this.data.startAt.next(this.data.searchterm);
            this.data.endAt.next(this.data.searchterm + '\uf8ff');
            this.searchTrue = true;
        } else {
            this.data.users = [];
            console.log('nyt');
            this.searchTrue = false;
            this.identifier = 'out';
        }

    }

    showAllUsers() {
        this.data.users = this.data.allusers;
        this.identifier = this.identifier === 'out' ? 'in' : 'out';
    }

    cancelSearch() {
        this.data.users = [];
        (<HTMLInputElement>document.getElementById('searchbar')).value = '';
        this.identifier = this.identifier === 'out' ? 'in' : 'out';
    }

    skillSelection() {
        this.selectTrue = true;
this.selection = this.selection === 'out' ? 'in' : 'out';
this.selectTrue = false;
    }


    // Kokeilu luoda mediat javascriptillä
    async getSrcURL(URLs) {
        if (URLs) {
            for (let i = 0; i < URLs.length; i++) {
                // this.afs.doc('files/' + files[i]);
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
                    const img = document.createElement('img');
                    img.setAttribute('src', URLs[i]);
                    document.getElementById('id' + i).appendChild(img);
                }
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/videos')) {
                    const video = document.createElement('video');
                    video.setAttribute('controls', '');
                    video.setAttribute('style', 'max-height: 200px');
                    const source = document.createElement('source');
                    source.setAttribute('src', URLs[i]);
                    document.getElementById('id' + i).appendChild(video);
                }
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/audios')) {
                    const audio = document.createElement('audio');
                    audio.setAttribute('controls', '');
                    audio.setAttribute('style', 'max-height: 200px');
                    const source = document.createElement('source');
                    source.setAttribute('src', URLs[i]);
                    document.getElementById('id' + i).appendChild(audio);
                }


                console.log(this.fileDoc);
                // fileUrls.push(this.fileDoc.downloadURL)
            }
        }


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

    async presentModal() {
        const modal = await this.modalController.create({
            component: ModalComponent,
            componentProps: {value: 123}
        });
        return await modal.present();
    }

    async presentCertificate(id) {
        localStorage.setItem('cid', id);
        const modal = await this.modalController.create({
            component: CertificateCardComponent,
            componentProps: {value: 123}
        });
        return await modal.present();
    }


    setInput() {
        this.inputTrue = true;
    }

    private createUserDoc(user) {
        console.log(this.data.user);

        const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

        const data: User = {
            uid: user.uid,
            email: user.email || null,
            photoURL: 'https://i.redd.it/coiddgklw4301.jpg',
            nickName: 'Nickname',
            description: 'Description'
        };
        // console.log(user.uid);
        // console.log(user.email);
        return userRef.set(data);

    }

    signOut() {
        this.fireAuth.auth.signOut()
            .then(() => {
                this.navCtrl.navigateForward('login');
            });
    }


    ngOnInit() {
        this.data.user = firebase.auth().currentUser;   // asettaa data-serviceen userin arvoks json-objektin josta voi poimii arvoi
        const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${this.data.user.uid}/`);
        userRef.ref.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('ei oo olemassa --> tee');
                    this.createUserDoc(this.data.user);

                } else {
                    this.data.user = doc.data();
                    console.log('on olemassa, elä tee!');
                    console.log(doc.data());
                }
            });
        this.certificatesCol = this.afs.collection('certificates', ref => ref.where('author', '==', this.data.user.uid)
        );
        this.data.getAllUsers().subscribe((users) => {
            this.data.allusers = users;
            console.log(this.data.allusers);
        });
        combineLatest(this.data.startobs, this.data.endobs).subscribe((value) => {
            this.data.getUsers(value[0], value[1]).subscribe((users) => {
                this.data.users = users;
                console.log(this.data.users);
            });
        });
        this.getCertificates();
        this.identifier = 'out';
        this.selection = 'out';
    }
}
