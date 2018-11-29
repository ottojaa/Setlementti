import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ModalComponent} from '../modal/modal.component';
import {CertificateCardComponent} from '../certificate-card/certificate-card.component';
import {DataService} from '../services/data.service';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import 'firebase/firestore';
import {combineLatest} from 'rxjs';
import * as firebase from 'firebase';
import {FriendlistComponent} from '../friendlist/friendlist.component';
import {FormsModule} from '@angular/forms';
import {NavController, AlertController} from '@ionic/angular';
import 'firebase/firestore';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import 'rxjs/Rx';
import {animate, state, style, transition, trigger} from '@angular/animations';

interface User {
    uid: string;
    email: string;
    photoURL: string;
    description?: string;
    nickName: string;
    mentor: boolean;
}

interface CV {
    date: string;
    owner: string;
    certificates: [];
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

interface FriendRequest {
    sender: string;
    senderEmail: string;
    approved: boolean;
}

interface Friend {
    id: string;
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
            transition('in => out', animate('0ms ease-out')),
            transition('out => in', animate('0ms ease-out'))
        ])
    ]
})
export class HomePage implements OnInit {
    private params = {};
    title;
    inputTrue = false;
    certificatesCol: AngularFirestoreCollection<Certificate>;
    cvCol: AngularFirestoreCollection<CV>;
    clientCol: AngularFirestoreCollection<Friend>;
    fileDoc: AngularFirestoreDocument<File>;
    certificates: any;
    CVs: any;
    users;
    searchTrue;
    receiver;
    sender;
    showList = false;
    friendRequests: AngularFirestoreCollection<FriendRequest>;
    friendReqs;
    selection;
    selectTrue;
    cvTrue;
    mentor;
    friends: any;
    queue = [];

    constructor(private fireAuth: AngularFireAuth, public modalController: ModalController,
                public data: DataService, public navCtrl: NavController,
                private afs: AngularFirestore, public alertController: AlertController) {


    }

    search($event) {
        this.data.searchterm = $event.target.value;

        if (this.data.searchterm !== '') {
            this.data.startAt.next(this.data.searchterm);
            this.data.endAt.next(this.data.searchterm + '\uf8ff');
            this.searchTrue = true;
            this.showList = true;
        } else {
            this.data.users = [];
            console.log('nyt');
            this.searchTrue = false;
            this.showList = false;
        }

    }

    showAllUsers() {
        this.data.users = this.data.allusers;
        this.showList = !this.showList;
    }

    cancelSearch() {
        this.data.users = [];
        (<HTMLInputElement>document.getElementById('searchbar')).value = '';
    }

    async confirmSend(index) {
        const alert = await this.alertController.create({
            message: '<strong>  Send request? </strong>',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                    }
                }, {
                    text: 'Yes',
                    handler: () => {
                        this.friendRequest(index);
                    }
                }
            ]
        });
        await alert.present();
    }

    skillSelection() {
        this.queue = [];
        this.selectTrue = true;
        this.selection = this.selection === 'out' ? 'in' : 'out';
        this.selectTrue = false;
    }

    showCVs() {
        this.cvTrue = true;
        document.getElementById('skillList').setAttribute('style', 'display: none');
        document.getElementById('cvList').setAttribute('style', 'display: block');
    }

    hideCVs() {
        this.cvTrue = false;
        document.getElementById('skillList').setAttribute('style', 'display: block');
        document.getElementById('cvList').setAttribute('style', 'display: none');
    }

    cvQueue(id) {
        this.queue.push(id);
    }

    goToCV() {
        this.afs.collection('CVs').add({date: new Date(), owner: this.data.user.uid, certificates: this.queue}).then((docRef) => {
            localStorage.setItem('CVid', docRef.id);
        }).then(() => {
            this.navCtrl.navigateForward('CV');

        });
    }

    presentCV(CVid) {
        localStorage.setItem('CVid', CVid);
        this.navCtrl.navigateForward('CV');
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

    async showAlert(message) {

        const alert = await this.alertController.create({
            message: message
        });
        await alert.present();
        setTimeout(() => {
            alert.dismiss();
        }, 2000);
    }

    friendRequest(index) {
        this.receiver = this.data.allusers[index].uid;
        const friends = this.data.friendList;
        const requests = this.data.friendRequests;
        if (requests.filter(f => f.sender === this.receiver).length > 0
            || friends.filter(e => e.sender === this.receiver).length > 0) {
            this.showAlert('Already requested or friends with');
        }
        if (this.receiver === this.data.user.uid) {
            this.showAlert('You can\'t request yourself silly');
        } else {
            this.afs.collection('users').doc(this.receiver).collection('friends').add({
                sender: this.data.user.uid,
                senderEmail: this.data.user.email,
                approved: false
            });
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

    getCVs() {
        this.CVs = this.cvCol.snapshotChanges().map(actions => {
            return actions.map(a => {
                const data = a.payload.doc.data() as CV;
                const id = a.payload.doc.id;
                return {id, data};
            });
        });
    }

    async presentFriendlist() {
        const modal = await this.modalController.create({
            component: FriendlistComponent,
            componentProps: {value: 123}
        });
        return await modal.present();
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
        console.log('höm?');
        console.log(this.data.user);

        const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

        const data: User = {
            uid: user.uid,
            email: user.email || null,
            photoURL: 'https://i.redd.it/coiddgklw4301.jpg',
            nickName: 'Nickname',
            description: 'Description',
            mentor: false
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


    checkMentor() {
        console.log(this.data.user);
        if (this.data.user.mentor === true) {
            this.mentor = true;
        } else {
            this.mentor = false;
        }
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
            }).then(() => {
            this.checkMentor();
        });
        this.certificatesCol = this.afs.collection('certificates', ref => ref.where('author', '==', this.data.user.uid)
        );
        this.cvCol = this.afs.collection('CVs', ref => ref.where('owner', '==', this.data.user.uid));
        this.data.getAllUsers().subscribe((users) => {
            this.data.allusers = users;
            console.log(this.data.allusers);
            this.getClients();
        });
        combineLatest(this.data.startobs, this.data.endobs).subscribe((value) => {
            this.data.getUsers(value[0], value[1]).subscribe((users) => {
                this.data.users = users;
                console.log(this.data.users);
            });
        });
        this.getCertificates();
        this.data.getFriendRequests().subscribe((requests => {
            this.data.friendRequests = requests;
            console.log(this.data.friendRequests);
        }));
        this.data.getFriendList().subscribe((friends => {
            this.data.friendList = friends;
            console.log(this.data.friendList);
        }));
        this.getCVs();
        this.selection = 'out';

    }

    // Mentorin omat funktiot

    getClients() {
        const mentorRef = this.afs.doc(`users/${this.data.user.uid}/`);
        this.clientCol = mentorRef.collection('friends', ref => ref.where('approved', '==', true));
        console.log(this.data.allusers);
        this.friends = this.clientCol.snapshotChanges().map(actions => {
            return actions.map(a => {
                for (let i = 0; i < this.data.allusers.length; i++) {
                    const id = a.payload.doc.id;
                    if (this.data.allusers[i].uid === id) {
                        const data = this.data.allusers[i];
                        return {id, data};
                    }
                }
            });
        });
    }

}
