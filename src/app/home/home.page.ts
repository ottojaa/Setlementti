import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ModalComponent} from '../modal/modal.component';
import {DataService} from '../services/data.service';
import {AngularFireAuth} from 'angularfire2/auth';
import {NavController, AlertController} from '@ionic/angular';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import 'firebase/firestore';
import * as firebase from 'firebase';

interface User {
    uid: string;
    email: string;
    photoURL: string;
    description?: string;
    nickName: string;
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

    constructor(private fireAuth: AngularFireAuth, public modalController: ModalController,
                public data: DataService, public navCtrl: NavController, private afs: AngularFirestore) {

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
        console.log(user.uid);
        console.log(user.email);
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
        console.log(this.data.user.uid);
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
    }
}
