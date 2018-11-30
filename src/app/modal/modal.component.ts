import {
    Component, OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import { NavController, ModalController, Events } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection  } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as firebase from 'firebase/app';
require('firebase/auth');
import { HttpClient } from '@angular/common/http';
import { stringify } from '@angular/core/src/render3/util';
import { Certificate } from 'tls';

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
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    animations: [
        trigger('slideInOut', [
            state('in', style({
                overflow: 'hidden',
                height: '*',
                width: '100%'
            })),
            state('out', style({
                opacity: '0',
                overflow: 'hidden',
                height: '*',
                width: '0'
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
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

    uploadFiles;
    title;
    query;
    inputTrue;
    files;
    fileids;
    file: any;
    inputsN: number;
    fileCounter: number;
    iCounter: number;
    task: AngularFireUploadTask;
    filesid: any;
    imagePreview = false;
    @ViewChild('canvas') canvasEl: ElementRef;
    @ViewChild('#tableBanner') previewImg: ElementRef;

    // Progress monitoring
    percentage: Observable<number>;
    snapshot: Observable<any>;

    // Download URL
    downloadURL: Observable<string>;

    // State for dropzone CSS toggling
    isHovering: boolean;
    /**
     * Reference Canvas object
     */

    // private _CANVAS  : any;


    /**
     * Reference the context for the Canvas element
     */
    // private _CONTEXT : any;
    downloadURLs;
    identifier;
    userCol: AngularFirestoreCollection<User>;
    mentors;
    mentorTrue;
    mentorArray;
    friends;

    constructor(private nav: NavController, private modalController: ModalController, public data: DataService,
        private storage: AngularFireStorage, private db: AngularFirestore, public events: Events) {
    }

    upload(): void {
        this.uploadFiles = this.uploadFiles === 'out' ? 'in' : 'out';
    }

    toggleHover(event: boolean) {
        this.isHovering = event;
    }


    makeVideoPreview() {
        const video = document.createElement('video');
        const parent = document.getElementById('previewSibling');
        parent.parentNode.insertBefore(video, parent.nextSibling);
        video.setAttribute('controls', '');
        video.setAttribute('style', 'max-height: 200px');
        const source = document.createElement('source');
        video.appendChild(source);
        source.setAttribute('src', URL.createObjectURL(this.file));
        this.createPreviewDelete(video, video);
    }

    makeAudioPreview() {
        const audio = document.createElement('audio');
        const parent = document.getElementById('previewSibling');
        parent.parentNode.insertBefore(audio, parent.nextSibling);
        audio.setAttribute('controls', '');
        const source = document.createElement('source');
        audio.appendChild(source);
        source.setAttribute('src', URL.createObjectURL(this.file));
        this.createPreviewDelete(audio, audio);
    }

    makeImgPreview() {
        const img = document.createElement('img');
        const parent = document.getElementById('previewSibling');
        parent.parentNode.insertBefore(img, parent.nextSibling);
        console.log(this.file.name);
        console.log('tän jälkee tulee');
        // console.log(localStorage.getItem('file'));
        img.setAttribute('src', URL.createObjectURL(this.file));
        img.setAttribute('style', 'height: 180px; width: 256px; object-fit: cover;');
        // this.drawPreview(img)
        this.createPreviewDelete(img, img);
        this.imagePreview = true;
    }

    createPreviewDelete(sibling, deletable) {
        const deleteButton = document.createElement('ion-button');
        deleteButton.setAttribute('style', 'top: 32%; right: 5%; position: absolute; z-index: 9999;');
        const icon = document.createElement('ion-icon');
        deleteButton.appendChild(icon);
        icon.setAttribute('name', 'close');
        sibling.parentNode.insertBefore(deleteButton, sibling.nextSibling);
        // Määritetään fileCounterilla poistettava, files-taulukkoon tallennettu tiedosto
        const deletableFile = this.fileCounter;
        // this.files
        console.log('tää indexi poistetaan' + deletableFile);
        const deletableInput = this.inputsN;
        this.fileCounter++;
        deleteButton.addEventListener('click', () => {
            this.deletePreview(deletable, deleteButton);
            this.deleteInput(deletableFile, deletableInput);
        });
    }

    deletePreview(toDelete, deleteButton) {
        this.fileCounter--;
        toDelete.remove();
        deleteButton.remove();
    }

    deleteInput(index, inputN) {
        this.inputsN = this.inputsN - 1;
        console.log('Mones tästä oikeastaan poistetaankaan?? HÄH? ' + index);
        console.log(this.files + '  minkälaine tää oli alunperi??');
        console.log(this.files[0]);
        /*this.files = */
        this.files.splice(index, 1);
        console.log(this.files + '  minkälaine täst arrayst tuli?');
        console.log(this.files[0]);
        document.getElementById('input' + inputN).remove();
    }

    createNewinput() {
        this.inputsN++;
    }

    // Määritetään uploadfilu ja tehdään uusi input
    defineUpload(event: FileList) {
        this.file = event.item(0);
        // Päivitetään uploadeja sisältävä taulukko
        this.files[this.fileCounter] = this.file;
        console.log(this.file);
        // Previewit, filuja ei lähetetä vielä mihinkään
        // this.uploadFiles = this.uploadFiles === 'in' ? 'out' : 'in';
        if (this.file.type.split('/')[0] === 'video') {
            this.makeVideoPreview();
        }
        if (this.file.type.split('/')[0] === 'audio') {
            this.makeAudioPreview();
        }
        // localStorage.setItem('file', this.file);
        if (this.file.type.split('/')[0] === 'image') {
            this.makeImgPreview();
        }

        this.createNewinput();

    }

    async startUpload(sentFile/*event: FileList*/) {
        // The File object
        // const file = event.item(0);
        console.log(sentFile);
        // Tiedostotyyppi
        if ((sentFile.type.split('/')[0] !== 'image') && (sentFile.type.split('/')[0] !== 'video')
            && (sentFile.type.split('/')[0] !== 'audio')) {
            console.error('unsupported file type :( ');
            return;
        }
        const finished = 0;
        // Kansio tiedostotyypin mukaan
        let filetype;
        if (sentFile.type.split('/')[0] === 'image') {
            filetype = `images/${new Date().getTime()}_${sentFile.name}`;
        }
        if (sentFile.type.split('/')[0] === 'video') {
            filetype = `videos/${new Date().getTime()}_${sentFile.name}`;
        }
        if (sentFile.type.split('/')[0] === 'audio') {
            filetype = `audios/${new Date().getTime()}_${sentFile.name}`;
        }
        const path = filetype;
        console.log(String(path));
        // Totally optional metadata
        const customMetadata = { app: 'My AngularFire-powered PWA!' };

        // The main task
        this.task = this.storage.upload(path, sentFile, { customMetadata });

        // Progress monitoring
        this.percentage = this.task.percentageChanges();
        console.log('haloo2');
        this.snapshot = this.task.snapshotChanges().pipe(
            tap(snap => {
                if (snap.bytesTransferred === snap.totalBytes) {
                    // Update firestore on completion
                    console.log(this.data.user.uid);
                    this.db.collection('files').add({ path, size: snap.totalBytes, sender: this.data.user.uid }).then((docRef) => {
                        console.log('Document written with ID: ', docRef.id);
                        this.fileids.push(docRef.id);
                        this.filesid = docRef.id;


                    }).then(() => {
                        console.log(this.filesid);
                        // const filesRef = this.db.collection('files');
                        console.log('haloo1');
                        this.iCounter++;
                    });

                }
            })
        );

        // The file's download URL
        this.snapshot.pipe(finalize(() => {
            this.downloadURL = this.storage.ref(path).getDownloadURL();
            const storage = firebase.storage();
            const storageRef = storage.ref();
            storageRef.child(path).getDownloadURL().then( (url) => {
                // Or inserted into an <img> element:
                this.downloadURLs.push(url);
                console.log(url + ' DOWNLOADURL');
                this.db.doc('files/' + this.filesid).update({downloadURL: url});
                if (this.iCounter === (this.inputsN - 1)) {
                    this.createPost();
                    console.log('CREATE POST');
                    setTimeout(() => {

                        this.closeModal();
                        console.log('closeModal!');
                    }, 1000);
                }
              }).catch(function(error) {
                // Handle any errors
              });


        }
            )).subscribe();
        /*this.snapshot.pipe(finalize(() => {
            const filesRef = this.db.collection('files');
            filesRef.doc(this.filesid).set({
                downloadURL: this.downloadURL
            }, { merge: true });
        })).subscribe();*/

    }

    isActive(snapshot) {
        return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
    }

    // Tallennetaan itse postaus tietokantaan

    createPost() {
        // let fileIdCollection = this.db.collection<Files>('files');
        // const header = document.getElementById('header').value;
        // Luodaan firebase-collection: certificates ja tallennetaan sinne otsikko, teksti, tiedostojen Id:t, tekijä, pvm
        console.log(this.fileids + ' upataanko mitä?');
        if (this.fileids.length === this.downloadURLs.length) {
        this.db.collection('certificates').add({
            title: this.title,
            text: this.query,
            files: this.fileids,
            downloadURLs: this.downloadURLs,
            author: this.data.user.uid,
            date: new Date(),
            sharedTo: this.mentorArray
        }).then((docRef) => {
            console.log('Document written with ID: ', docRef.id);
            const cid = docRef.id;
            this.db.doc('certificates/' + cid).update({cid: cid});
        });
    }
    }

    // File Upataan vasta updaten yhteydessä määritetyllä parametrillä
    async update() {
        this.uploadFiles = 'out';
        console.log(this.files.length);
        if (this.files.length > 0) {
            let i;
            for (i = 0; i < (this.inputsN); i++) {

                if (i < (this.inputsN - 1)) {
                    await this.startUpload(this.files[i]);
                    console.log('ÄNNIEN ARVO:    ' + this.inputsN);
                    console.log('iin arvo:    ' + i);
                }

            }
        } else {
            this.createPost();
            setTimeout(() => {
                this.closeModal();
            }, 200);

        }
        this.data.currentTime = Date.now();
        this.data.results.push({ 'title': this.title, 'text': this.query });
        this.inputTrue = false;
        console.log(this.data.results);
    }

    closeModal() {
        this.modalController.dismiss();

    }

    ngOnInit() {
        this.title = '';
        this.query = '';
        this.downloadURLs = [];
        this.mentorArray = [];
        this.fileids = [];
        this.files = [];
        this.fileCounter = 0;
        this.inputsN = 1;
        this.uploadFiles = 'out';
        this.identifier = 'out';
        this.iCounter = 0;
        this.mentorTrue = false;
        this.userCol = this.db.collection('users', ref => ref.where('mentor', '==', true));
        this.approved();
       // this.getMentors();
    }

// päivityksiä
   approved() {
        const clientRef = this.db.doc(`users/${this.data.user.uid}/`);
        const mentorCol = clientRef.collection('friends', ref => ref.where('approved', '==', true));
        console.log(this.data.allusers);
        this.friends = mentorCol.snapshotChanges().map(actions => {
            return actions.map(a => {
                for (let i = 0; i < this.data.allusers.length; i++) {
                const id = a.payload.doc.data() as Friend;
                if (this.data.allusers[i].uid === id.sender) {
                    const data = this.data.allusers[i];
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
