import {
  Component, OnInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import {NavController, ModalController, Events, AlertController} from '@ionic/angular';
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
  selector: 'app-edit-card',
  templateUrl: './edit-card.component.html',
  animations: [
      trigger('showHideButtons', [
          state('show', style({
            visibility: 'visible',
              height: '*',
              width: '*'
          })),
          state('hide', style({
              visibility: 'hidden',
              height: '0',
              width: '0'
          })),
          transition('hide => show', animate('300ms ease-in-out')),
          transition('show => hide', animate('300ms ease-in-out'))
      ])
  ],
  styleUrls: ['./edit-card.component.scss']
})
export class EditCardComponent implements OnInit {
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
    cid;
    cCollectionRef;

  constructor(private nav: NavController, private modalController: ModalController, public data: DataService,
    private storage: AngularFireStorage, private afs: AngularFirestore, public events: Events, public alertController: AlertController) { }
// tulevaisuudessa tulee tarkistaa, tallentuuko urlia vastaava filen id aina samaan indexinumeroon
    async pushSrcs(URLs, fileids) {
      if (URLs) {
          for (let i = 0; i < URLs.length; i++) {
              if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
                  this.imageSources.push({'imgsrc': URLs[i], 'title': 'Testaillaaan'});
                  this.inputTrue = false;
                  this.animationStates[i] = 'hide';
              }
              if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/videos')) {
                  this.videoSources.push({'videosrc': URLs[i]});
                  this.inputTrue = false;
                  this.animationStates[i] = 'hide';
              }
              if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/audios')) {
                  this.audioSources.push({'audiosrc': URLs[i]});
                  this.inputTrue = false;
                  this.animationStates[i] = 'hide';
              }
          }
      }
  }

    showButtons(i) {
      console.log('toimiiks click?');
      this.animationStates[i] = this.animationStates[i] === 'show' ? 'hide' : 'show';
      console.log(this.animationStates[i]);
    }
    closeModal() {
        this.pageData = [];
        this.modalController.dismiss();
    }
    changeFile() {

    }
    deletePreview() {

    }
    deleteCertificate() {
        this.cCollectionRef.delete().then(() => {
this.closeModal();
        });
    }

    async confirmDelete() {
        const alert = await this.alertController.create({
            message: '<strong>Really???</strong>',
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
                  this.deleteCertificate();
                }
              }
            ]
          });
          await alert.present();
    }
    deleteFile(url) {
        console.log(url);
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const idIndex = this.pageData.downloadURLs.indexOf(url);
        const fileid = this.pageData.files[idIndex];
        const fileRef: AngularFirestoreDocument<File> = this.afs.doc(`files/${fileid}/`);
        fileRef.ref.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('is not of existing');

                } else {
                    const fileData = doc.data();
                    const file = storageRef.child(fileData.path);
                    file.delete();
                }
            }).then(() => {
                fileRef.delete();
            });

        const collectionRef: AngularFirestoreDocument<Certificate> = this.afs.doc(`certificates/${this.cid}/`);
        collectionRef.update({
            files: this.pageData.files.filter(file => file !== fileid)
        });
        collectionRef.update({
            downloadURLs: this.pageData.downloadURLs.filter(downloadURL => downloadURL !== url)
        }).then(() => { this.getMedia(this.cid); });

    }
    /*// muuttujat ajan tasalle
    updateMedia() {
        const collectionRef: AngularFirestoreDocument<Certificate> = this.afs.doc(`certificates/${this.cid}/`);
    collectionRef.ref.get()
    .then(doc => {
        if (!doc.exists) {
            console.log('is not of existing');

        } else {
            this.pageData = doc.data();
            this.pushSrcs(this.pageData.downloadURLs, this.pageData.files);
        }
    });
    }*/
  async getMedia(cid) {
    const collectionRef: AngularFirestoreDocument<Certificate> = this.afs.doc(`certificates/${cid}/`);
    this.cCollectionRef = collectionRef;
    collectionRef.ref.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('is not of existing');

            } else {
                this.pageData = doc.data();
                console.log(this.pageData.downloadURLs);
                this.pushSrcs(this.pageData.downloadURLs, this.pageData.files);
                console.log('success');
                console.log(doc.data());
            }
        });
}

ngOnInit() {
  this.cid = localStorage.getItem('cid');
  console.log(this.cid);
  this.getMedia(this.cid);
  this.data.currentTime = Date.now();
  this.inputTrue = false;
  this.title = '';
  this.query = '';
}

}
