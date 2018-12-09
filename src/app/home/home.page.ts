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
    CV: string;
}

interface CV {
    date: any;
    owner: string;
    CVid: string;
    certificates: {};
    sharedTo: string;
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
        ]),
        trigger('slide', [
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
    cvCol: AngularFirestoreCollection<CV>;
    clientCol: AngularFirestoreCollection<Friend>;
    fileDoc: AngularFirestoreDocument<File>;
    certificates: any;
    CVs: any;
    users;
    searchTrue;
    receiver;
    receiverData;
    sender;
    showCards = true;
    showList = false;
    friendRequests: AngularFirestoreCollection<FriendRequest>;
    friendReqs;
    selection;
    selectTrue;
    cvTrue;
    mentor;
    friends: any;
    queue = [];
    cURLs = new Object;
    cvExists;
    mentorArray;
    mentorTrue = false;
    identifier;
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

    showHomeCards() {
        this.showCards = !this.showCards;
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
        /*if (this.cURLs.hasOwnProperty(id)) {
            delete this.cURLs[id];
        } else {
        this.cURLs[id] urls;
        }*/
        if (this.queue.includes(id)) {
            const index = this.queue.indexOf(id);
            this.queue.splice(index, 1);
        } else {
        this.queue.push(id);
        }
        console.log(this.queue);
    }
checkCV() {
    if (this.data.user.CV.length > 3) {
        console.log('CV on olemassa');
        this.cvExists = true;
    } else {
        console.log('CV ei oo olemassa');
        this.cvExists = false;
    }
}
    goToCV() {
        this.cvExists = true;
        console.log(this.data.user.CV);
        if (this.data.user.CV.length > 1) {
            console.log('päivitetään CV');
            const CVref: AngularFirestoreDocument<CV> = this.afs.doc(`CVs/${this.data.user.CV}`);
            const data: CV = {
                date: new Date(),
                owner: this.data.user.uid,
                CVid: this.data.user.CV,
                certificates: this.queue,
                sharedTo: this.mentorArray
            };
            CVref.set(data).then(() => {
                // userid localstorageen, jotta muidenkin olisi mahdollista mahdollisesti tarkastella kyseistä CV:tä
                localStorage.setItem('owner', JSON.stringify(this.data.user));
                localStorage.setItem('CVid', this.data.user.CV);
                this.skillSelection();
                this.navCtrl.navigateForward('CV');
            });
        } else {
            console.log('luodaan uusi CV');
        this.afs.collection('CVs').add({ date: new Date(), owner: this.data.user.uid, certificates: this.queue,
            sharedTo: this.mentorArray}).then((docRef) => {
            // userid localstorageen, jotta muidenkin olisi mahdollista mahdollisesti tarkastella kyseistä CV:tä
            localStorage.setItem('owner', JSON.stringify(this.data.user));
            localStorage.setItem('CVid', docRef.id);
            this.afs.doc(`CVs/${docRef.id}`).update({ CVid: docRef.id });
            this.afs.doc(`users/${this.data.user.uid}`).update({CV: docRef.id});
        }).then(() => {
            this.skillSelection();
            this.navCtrl.navigateForward('CV');

            });
        }
    }

    presentCV(CVid) {
        // userid localstorageen, jotta muidenkin olisi mahdollista mahdollisesti tarkastella kyseistä CV:tä
        localStorage.setItem('owner', JSON.stringify(this.data.user));
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
        this.receiverData = this.data.allusers[index];
        console.log(this.receiverData);
        const friends = this.data.friendList;
        const requests = this.data.friendRequests;
        const sent = this.data.sentRequests;
        console.log(this.data.sentRequests);
        console.log(this.data.friendRequests);
        console.log(this.data.friendList);
        if (requests.filter(f => f.receiver === this.receiver).length > 0
            || requests.filter(f => f.sender === this.receiver).length > 0
            || friends.filter(e => e.sender === this.receiver).length > 0
            || friends.filter(e => e.receiver === this.receiver).length > 0
            || sent.filter(e => e.receiver === this.receiver).length > 0) {
            this.showAlert('Already requested or friends with');
            return;
        }
        if (this.receiver === this.data.user.uid) {
            this.showAlert('You can\'t request yourself silly');
            return;
        } else {
            console.log(this.data.sentRequests);
            this.afs.collection('users').doc(this.receiver).collection('friends').add({
                sender: this.data.user.uid,
                senderEmail: this.data.user.email,
                approved: false,
                senderNickname: this.data.user.nickName,
                senderPhotoURL: this.data.user.photoURL,
                sentByYou: false,
                senderDescription: this.data.user.description,
                senderAge: this.data.user.age,
                senderCV: this.data.user.CV
            });
            this.afs.collection('users').doc(this.data.user.uid).collection('friends').add({
                receiverEmail: this.receiverData.email,
                receiverPhotoURL: this.receiverData.photoURL,
                receiverNickname: this.receiverData.nickName,
                receiver: this.receiver,
                approved: false,
                sentByYou: true,
                receiverDescription: this.receiverData.description,
                receiverAge: this.receiverData.age,
                receiverCV: this.receiverData.CV
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
            photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0O0BcfpQpLH0uB58WXFCYAGuWjp4IhcPO63_caGFGMOrK_9qG',
            nickName: 'Nickname',
            description: 'Description',
            mentor: false,
            CV: ''
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

    pickMentor(uid) {
        if (this.mentorArray.includes(uid)) {
            const index = this.mentorArray.indexOf(uid);
            this.mentorArray.splice(index, 1);
        } else {
        this.mentorArray.push(uid);
        }
    }

    pickMentors() {
        if (this.mentorTrue === false) {
            this.mentorTrue = true;
        } else {
            /*const check = document.querySelectorAll('checkboxCV');
            for (let i = 0; i < (check.length - 1); i++) {
            check[i].click();
            }*/
            this.mentorArray = [];
            this.mentorTrue = false;
        }
        this.identifier = this.identifier === 'out' ? 'in' : 'out';
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
                    this.checkCV();
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
            console.log(this.receiver);
        }));
        this.data.getFriendList().subscribe((friends => {
            this.data.friendList = friends;
            console.log(this.data.friendList);
        }));
        this.data.getSentRequests().subscribe((sent => {
            this.data.sentRequests = sent;
            console.log(this.data.sentRequests);
        }));
        this.getCVs();
        this.data.profilePicture = this.data.user.photoURL;
        console.log(this.data.user.CV);
        this.selection = 'out';
        this.identifier = 'out';
        this.mentorArray = [];
    }

    // Mentorin omat funktiot

    presentClient(number) {
const data = this.data.friendList[number];
console.log(this.data.friendList);
console.log(data);
this.data.client = {};
if (data.sender != null) {
this.data.client.photoURL = data.senderPhotoURL;
this.data.client.nickName = data.senderNickname;
this.data.client.uid = data.sender;
this.data.client.approved = data.approved;
this.data.client.sentByYou = data.sentByYou;
this.data.client.description = data.senderDescription;
this.data.client.age = data.senderAge;
this.data.client.email = data.senderEmail;
this.data.client.CV = data.senderCV;
} else {
    this.data.client.photoURL = data.receiverPhotoURL;
this.data.client.nickName = data.receiverNickname;
this.data.client.uid = data.receiver;
this.data.client.approved = data.approved;
this.data.client.sentByYou = data.sentByYou;
this.data.client.description = data.receiverDescription;
this.data.client.age = data.receiverAge;
this.data.client.email = data.receiverEmail;
this.data.client.CV = data.receiverCV;
}



this.navCtrl.navigateForward('client-profile');
    }
    /*getClients() {
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
    } */

}
