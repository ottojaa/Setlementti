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
import {take, finalize} from 'rxjs/operators';
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
    selector: 'app-mentor-card',
    templateUrl: './mentor-card.component.html',
    styleUrls: ['./mentor-card.component.scss'],
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
    ]
})


export class MentorCardComponent implements OnInit {
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
    commentIndex;
    tempId;
    initialRating;
    starTitle = 'Star Rating';
    starList: boolean[] = [true, true, true, true, true];       // create a list which contains status of 5 stars
    rating: number;
    isReadOnly = true;
    animationStates = [];
    commenting;
    commentData;
    mentors;
    mentorTrue;
    mentorArray;
    friends;
    identifier;
    comment;

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

    addComment() {
        console.log(this.commentIndex);
        this.tempId = this.afs.createId();
        this.afs.collection('certificates').doc(this.cid).collection('comments').doc(this.tempId).set({
            sender: this.data.user.uid,
            senderNickname: this.data.user.nickName,
            senderPhotoURL: this.data.user.photoURL,
            comment: this.comment,
            time: this.data.currentTime,
            id: this.tempId,
        });
        console.log(this.commentIndex);
        this.commenting = !this.commenting;
        this.comment = '';
    }

    deleteComment(i) {
        console.log(this.commentIndex);
        this.afs.collection('certificates')
            .doc(this.cid)
            .collection('comments').doc(this.commentData[i].id).delete();
    }
    async confirmDelete(i) {
        const alert = await this.alertController.create({
            message: '<strong>Delete comment?</strong>',
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
                        this.deleteComment(i);
                    }
                }
            ]
        });
        await alert.present();
    }
    setStar(data: any) {
        const collectionRef = this.afs.collection('certificates').doc(this.cid).collection('ratings').doc(this.data.user.uid);
        this.rating = data + 1;
        for (let i = 0; i <= 4; i++) {
            if (i <= data) {
                this.starList[i] = false;
            } else {
                this.starList[i] = true;
            }
        }
        collectionRef.set({
            rating: this.rating,
            ratedBy: this.data.user.uid,
        });
    }

    ngOnInit() {
        this.cid = this.data.clientCertificate.id;
        this.getMedia(this.cid);
        this.data.currentTime = Date.now();
        this.inputTrue = false;
        this.title = '';
        this.query = '';
        this.commenting = false;
        this.mentorTrue = false;
        this.mentorArray = [];
        this.identifier = 'out';
        console.log(this.data.friendList);
        this.data.getComments(this.cid).subscribe((comments => {
            this.data.commentIndex = comments.length;
            this.data.commentData = comments;
            console.log(this.data.commentData);
        }));
        this.data.getRatings(this.cid).take(1).subscribe(( ratings => {
            this.data.ratingData = ratings;
            this.initialRating = this.data.ratingData[0].rating;
            this.setStar(this.initialRating - 1);
        }));

    }

    // päivityksiä
    approved() {
        const clientRef = this.afs.doc(`users/${this.data.client.uid}/`);
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


}
