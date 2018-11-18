import {
  Component, OnInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { NavController, ModalController, Events } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as firebase from 'firebase/app';

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
  selector: 'app-certificate-card',
  templateUrl: './certificate-card.component.html',
  animations: [
    trigger('slideInOut', [
        state('in', style({
            overflow: 'hidden',
            height: '*',
            width: '300px'
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
  styleUrls: ['./certificate-card.component.scss']
})
export class CertificateCardComponent implements OnInit {
  title;
  query;
  inputTrue;
  certificatesCol: AngularFirestoreCollection<Certificate>;
  certificates: any;
  certificate: Observable<Certificate>;
  constructor(private nav: NavController, private modalController: ModalController, public data: DataService,
    private storage: AngularFireStorage, private afs: AngularFirestore, public events: Events) { }

pushSrcs(URLs) {
  if (URLs) {
    for (let i = 0; i < URLs.length; i++) {
      console.log(URLs[i]);
        // this.afs.doc('files/' + files[i]);
        if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
          this.data.results.push({'part.imgsrc': URLs[i]});
        }
        if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/videos')) {
          this.data.results.push({'part.videosrc': URLs[i]});
        }
        if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/audios')) {
          this.data.results.push({'part.audiosrc': URLs[i]});
        }
    }
    console.log(this.data.results);
}
}

  closeModal() {
    this.data.results = [];
    this.modalController.dismiss();
  }

  getMedia(cid) {
    this.certificatesCol = this.afs.collection('certificates', ref => ref.where('cid', '==', cid));
    this.certificates = this.certificatesCol.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Certificate;
        console.log(data);
        const id = a.payload.doc.id;
        this.pushSrcs(data.downloadURLs);
        return { id, data };
      });
    });
      console.log(this.certificates);
      // this.pushSrcs(this.certificates.data.downloadURLs);

  }

  ngOnInit() {
    const cid = localStorage.getItem('cid');
    console.log(cid);
    this.getMedia(cid);
    this.data.currentTime = Date.now();
    // this.data.results.push({ 'title': this.title, 'text': this.query });
    this.inputTrue = false;
    this.title = '';
    this.query = '';
    /*this.downloadURLs = [];
    this.fileids = [];
    this.files = [];
    this.fileCounter = 0;
    this.inputsN = 1;
    this.uploadFiles = 'out';
    this.iCounter = 0;*/
  }

}

