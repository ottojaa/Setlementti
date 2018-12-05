import {
    Component, OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import {NavController, ModalController, Events, AlertController} from '@ionic/angular';
import {DataService} from '../services/data.service';
import {AngularFireStorage, AngularFireUploadTask} from 'angularfire2/storage';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {EditCardComponent} from '../edit-card/edit-card.component';

interface Certificate {
    author: string;
    date: string;
    files: {};
    text: string;
    title: string;
    cid: string;
    downloadURLs: {};
    sharedTo: [];
}

interface User {
    uid: string;
    email: string;
    photoURL: string;
    description?: string;
    nickName: string;
    mentor: boolean;
}

interface Friend {
    approved: boolean;
    sender: string;
    senderEmail: string;
}
@Component({
    selector: 'app-certificate-card',
    templateUrl: './certificate-card.component.html',
    animations: [
        trigger('slideInOut', [
            state('in', style({
                overflow: 'hidden',
                height: '*',
                width: '*'
            })),
            state('out', style({
                overflow: 'hidden',
                height: '20px',
                width: '*'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
        trigger('buttons', [
            state('in', style({
                overflow: 'hidden',
                height: '*',
                width: '*'
            })),
            state('out', style({
                overflow: 'hidden',
                height: '20px',
                width: '*'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
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
    ],
    styleUrls: ['./certificate-card.component.scss']
})


export class CertificateCardComponent implements OnInit {
    text: string;
    title: string;
    query;
    inputTrue;
    cid;
    date = new Date();
    certificates: any;
    pageData;
    imageSources = new Array();
    videoSources = new Array();
    audioSources = new Array();
    editMode = false;
    isReadOnly = true;
    animationStates = [];
    mentors;
    mentorTrue;
    mentorArray;
    friends;
    identifier;
    constructor(private nav: NavController,
                private modalController: ModalController,
                public data: DataService,
                private storage: AngularFireStorage,
                private afs: AngularFirestore,
                public events: Events,
                public alertController: AlertController) {
    }

    closeModal() {
        this.pageData = [];
        this.modalController.dismiss();
    }

    minimize(i) {
        this.animationStates[i] = this.animationStates[i] === 'out' ? 'in' : 'out';
    }

    editUpload() {
        this.closeModal();
    }

    async confirmChanges(index, message) {
        const alert = await this.alertController.create({
            message: '<strong>' + message + '</strong>',
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
                        this.deleteMedia(index);
                    }
                }
            ]
        });
        await alert.present();
    }

    async confirmDelete(message) {
        const alert = await this.alertController.create({
            message: '<strong>' + message + '</strong>',
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
                        this.deleteDocument();
                        this.modalController.dismiss();
                    }
                }
            ]
        });
        await alert.present();
    }

    deleteMedia(index) {
        /* Poistaa tiedoston ja downloadurlin indexin osottamasta paikasta, ja päivittää sit dokumentin uusilla tiedoilla.
           poistaa sen myös noista erillisistä taulukoista (image/video/audiosrcs) että modaali päivittyy oikein*/
        console.log(this.pageData);
        const modalRef: AngularFirestoreDocument<Certificate> = this.afs.doc(`certificates/${this.cid}`);
        modalRef.ref.get().then((doc => {
            this.pageData = doc.data();
            console.log(this.pageData);
        }));
        this.pageData.files.splice(index, 1);
        this.pageData.downloadURLs.splice(index, 1);
        if (this.imageSources.length !== 0) {
            this.imageSources.splice(index, 1);
        }
        if (this.videoSources.length !== 0) {
            this.videoSources.splice(index, 1);
        }
        if (this.audioSources.length !== 0) {
            this.audioSources.splice(index, 1);
        }
        const data: Certificate = {
            text: this.text,
            title: this.title,
            author: this.pageData.author,
            date: this.pageData.date,
            files: this.pageData.files,
            downloadURLs: this.pageData.downloadURLs,
            cid: this.cid,
            sharedTo: this.mentorArray,
        };
        console.log(this.pageData);
        return modalRef.set(data);
    }

    deleteDocument() {
        this.afs.doc(`certificates/${this.cid}`).delete();
    }

    async pushSrcs(URLs) {
        if (URLs) {
            for (let i = 0; i < URLs.length; i++) {
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
                    this.imageSources.push({'imgsrc': URLs[i], 'title': 'Testaillaaan'});
                    console.log(this.imageSources);
                    console.log('hirvi');
                    this.inputTrue = false;
                    this.animationStates[i] = 'in';
                }
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/videos')) {
                    this.videoSources.push({'videosrc': URLs[i]});
                    this.inputTrue = false;
                    this.animationStates[i] = 'in';
                }
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/audios')) {
                    this.audioSources.push({'audiosrc': URLs[i]});
                    this.inputTrue = false;
                    this.animationStates[i] = 'in';
                }
            }
        }
    }

    updateCertificate(cid) {
        /* Tää on tekstii ja titlee varten, käytännössä siis kirjottaa tonne firestoredokumenttiin vanhan päälle sen stringin mikä
           saadaan ngmodelilla meidän sivulta input ja textareasta */
        console.log(this.pageData.files);
        const modalRef: AngularFirestoreDocument<Certificate> = this.afs.doc(`certificates/${cid}`);
        modalRef.ref.get().then((doc => {
            this.pageData = doc.data();
            console.log(this.pageData);
        }));
        const data: Certificate = {
            text: this.text,
            title: this.title,
            author: this.pageData.author,
            date: this.pageData.date.toDate(),
            files: this.pageData.files,
            downloadURLs: this.pageData.downloadURLs,
            cid: cid,
            sharedTo: this.mentorArray
        };
        this.identifier = 'out';
        this.toggleReadOnly();
        return modalRef.set(data);
    }

    toggleReadOnly() {
        this.editMode = !this.editMode;
        this.isReadOnly = !this.isReadOnly;
        console.log(this.isReadOnly);
    }

    async getMedia(cid) {
        const collectionRef: AngularFirestoreDocument<Certificate> = this.afs.doc(`certificates/${cid}/`);
        collectionRef.ref.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('is not of existing');

                } else {
                    this.pageData = doc.data();
                    console.log(this.pageData.text);
                    if (this.pageData.text) {
                        this.text = this.pageData.text;
                    }
                    if (this.pageData.title) {
                        this.title = this.pageData.title;
                    }
                    if (this.pageData.date) {
                        this.date = this.pageData.date;
                        console.log(this.date);
                    }
                    console.log(this.pageData.downloadURLs);
                    this.pushSrcs(this.pageData.downloadURLs);
                    console.log(doc.data());
                }
            });
    }

    ngOnInit() {
        this.cid = localStorage.getItem('cid');
        this.getMedia(this.cid);
        this.data.currentTime = Date.now();
        this.inputTrue = false;
        this.title = '';
        this.query = '';
        this.mentorTrue = false;
        this.mentorArray = [];
        this.identifier = 'out';
        console.log(this.data.friendList);
        this.approved();

    }

    // päivityksiä
   approved() {
    const clientRef = this.afs.doc(`users/${this.data.user.uid}/`);
    const mentorCol = clientRef.collection('friends', ref => ref.where('approved', '==', true));
    this.friends = mentorCol.snapshotChanges().map(actions => {
        return actions.map(a => {
            for (let i = 0; i < this.data.allusers.length; i++) {
            const id = a.payload.doc.data();
            if (this.data.allusers[i].uid === id.sender) {
                const data = this.data.allusers[i];
                console.log(id);
            return {id, data};
            }
            }
        });
    });
}




/*getMentors() {
    this.mentors = this.userCol.snapshotChanges().map(actions => {
        return actions.map(a => {
            const data = a.payload.doc.data() as User;
            const id = a.payload.doc.id;
            return { id, data };
        });
    });
}*/

pickMentors() {
    if ( this.mentorTrue === false) {
    this.mentorTrue = true;
    } else {
        
        this.mentorArray = [];
        this.mentorTrue = false;
    }
    this.identifier = this.identifier === 'out' ? 'in' : 'out';
}

pickMentor(uid) {
    if (this.mentorArray.includes(uid)) {
        const index = this.mentorArray.indexOf(uid);
        this.mentorArray.splice(index, 1);
    } else {
    this.mentorArray.push(uid);
    }
}

}

