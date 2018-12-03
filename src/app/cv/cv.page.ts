import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { CertificateCardComponent } from '../certificate-card/certificate-card.component';
import { DataService } from '../services/data.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import 'firebase/firestore';
import { combineLatest } from 'rxjs';
import * as firebase from 'firebase';
import { FriendlistComponent } from '../friendlist/friendlist.component';
import { FormsModule } from '@angular/forms';
import { NavController, AlertController } from '@ionic/angular';
import 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { animate, state, style, transition, trigger } from '@angular/animations';

interface CV {
  date: any;
  owner: string;
  certificates: [];
  CVid: string;
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
  selector: 'app-cv',
  templateUrl: './cv.page.html',
  styleUrls: ['./cv.page.scss'],
})
export class CVPage implements OnInit {
  CVid: string;
  cvCol: AngularFirestoreDocument<CV>;
  CV;
  certificates;
  cCol: AngularFirestoreCollection<Certificate>;
  owner: string;
  imageSources = new Array();
  videoSources = new Array();
  audioSources = new Array();
  i = 0;
  v = 0;
  a = 0;
  urlLength = {img: this.i, video: this.v, audio: this.a};
  constructor(private fireAuth: AngularFireAuth, public modalController: ModalController,
    public data: DataService, public navCtrl: NavController,
    private afs: AngularFirestore, public alertController: AlertController) { }

  ngOnInit() {
    this.owner = JSON.parse(localStorage.getItem('owner'));
    this.certificates = [];
    this.CVid = localStorage.getItem('CVid');
    this.cvCol = this.afs.doc(`CVs/${this.CVid}/`);
    this.getCV();

  }

  getCV() {
    this.cvCol.get().subscribe((doc) => {
      const data = doc.data() as CV;
      this.CV = data;
      this.getCertificates(data);
    });
  }

  getCertificates(cvData) {
    for (let i = 0; i < cvData.certificates.length; i++) {
      this.cCol = this.afs.collection('certificates', ref => ref.where('cid', '==', cvData.certificates[i]));
      this.certificates[i] = this.cCol.snapshotChanges().map(actions => {
        return actions.map(a => {
          this.i = 0;
            this.v = 0;
            this.a = 0;
            this.urlLength = {img: this.i, video: this.v, audio: this.a};
          const data = a.payload.doc.data() as Certificate;
          const id = a.payload.doc.id;
          // for (let i = 0; i < data.downloadURLs.length)

          this.pushSrcs(data.downloadURLs).then(() => {
          });
          const urlLength = this.urlLength;
         
          console.log(urlLength);
          return { id, data, urlLength };
        });
      });
    }
  }

getLength() {
}

  async pushSrcs(URLs) {

    if (URLs) {
console.log(URLs);
      for (let i = 0; i < URLs.length; i++) {
        if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
          this.imageSources.push({ 'imgsrc': URLs[i]});
          this.i++;
          this.urlLength.img = this.i;

        }
        if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/videos')) {
          this.videoSources.push({ 'videosrc': URLs[i]});
          this.v++;
          this.urlLength.video = this.v;
        }
        if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/audios')) {
          this.audioSources.push({ 'audiosrc': URLs[i]});
          this.a++;
          this.urlLength.audio = this.a;

        }
      }

    }
  }

}
