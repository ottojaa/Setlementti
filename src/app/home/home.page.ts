import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ModalComponent} from '../modal/modal.component';
import {DataService} from '../services/data.service';
import {AngularFireAuth} from 'angularfire2/auth';
import {NavController, AlertController} from '@ionic/angular';
import {AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import 'firebase/firestore';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import 'rxjs/Rx';

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
})
export class HomePage implements OnInit {
    private params = {};
    title;
    inputTrue = false;
    lista = [];
    listPart = this.lista[0];
    certificateDoc: AngularFirestoreDocument<Certificate>;
    certificatesCol: AngularFirestoreCollection<Certificate>;
    fileDoc: AngularFirestoreDocument<File>;
    filesCol: AngularFirestoreCollection<File>;
    certificates: any;
    certificate: Observable<Certificate>;

    constructor(private fireAuth: AngularFireAuth, public modalController: ModalController,
                public data: DataService, public navCtrl: NavController, private afs: AngularFirestore, private db: AngularFirestore) {

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
                console.log(data);
                console.log(data.downloadURLs);
                // this.getSrcURL(data.downloadURLs);
                const id = a.payload.doc.id;
                return { id, data };
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

        // console.log(document.getElementById('card1').innerHTML);

        // console.log(this.data.user.uid);
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
            this.getCertificates();
       // for (let i = 0; i <= certificates.length) {

       // }
    }
}
