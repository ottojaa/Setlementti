import {
    Component, OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import {NavController, ModalController, Events} from '@ionic/angular';
import {DataService} from '../services/data.service';
import {AngularFireStorage, AngularFireUploadTask} from 'angularfire2/storage';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators/map';
import {tap} from 'rxjs/operators';
import {finalize} from 'rxjs/operators';
import {trigger, state, style, animate, transition} from '@angular/animations';
import * as firebase from 'firebase/app';

interface Certificate {
    author: string;
    date: string;
    files: {};
    text: string;
    title: string;
    downloadURLs: {};
    cid: string;
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
        ])
    ],
    styleUrls: ['./certificate-card.component.scss']
})


export class CertificateCardComponent implements OnInit {

    title;
    query;
    inputTrue;
    certificates: any;
    pageData;
    imageSources = new Array();
    videoSources = new Array();
    audioSources = new Array();
    animationState;
    expansionIndex;
    animationStates = [];

    constructor(private nav: NavController, private modalController: ModalController, public data: DataService,
                private storage: AngularFireStorage, private afs: AngularFirestore, public events: Events) {
    }

    async pushSrcs(URLs) {
        if (URLs) {
            for (let i = 0; i < URLs.length; i++) {
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
                    this.imageSources.push({'imgsrc': URLs[i], 'title': 'Testaillaaan'});
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


    closeModal() {
        this.pageData = [];
        this.modalController.dismiss();
    }

    minimize(i) {
        this.animationStates[i] = this.animationStates[i] === 'out' ? 'in' : 'out';
    }

    async getMedia(cid) {
        const collectionRef: AngularFirestoreDocument<Certificate> = this.afs.doc(`certificates/${cid}/`);
        collectionRef.ref.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('is not of existing');

                } else {
                    this.pageData = doc.data();
                    console.log(this.pageData.downloadURLs);
                    this.pushSrcs(this.pageData.downloadURLs);
                    console.log('success');
                    console.log(doc.data());
                }
            });
    }

    ngOnInit() {
        const cid = localStorage.getItem('cid');
        console.log(cid);
        this.getMedia(cid);
        this.inputTrue = false;
        this.title = '';
        this.query = '';
    }
}

