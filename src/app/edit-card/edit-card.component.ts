import {
    Component, OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import { NavController, ModalController, Events, AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';
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
    files = [];
    // Progress monitoring
    percentage: Observable<number>;
    snapshot: Observable<any>;
    fileCount;

    // Download URL
    downloadURL: Observable<string>;

    task: AngularFireUploadTask;
    deletableURLs = [];
    oldURLs = [];
    fileids = [];
    filesid: any;
    iCounter: number;
    downloadURLs = [];
    constructor(private nav: NavController, private modalController: ModalController,
        public data: DataService, private storage: AngularFireStorage,
        private afs: AngularFirestore, public events: Events, public alertController: AlertController) { }
    // tulevaisuudessa tulee tarkistaa, tallentuuko urlia vastaava filen id aina samaan indexinumeroon
    async pushSrcs(URLs, fileids) {
        if (URLs) {
            for (let i = 0; i < URLs.length; i++) {
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
                    this.imageSources.push({ 'imgsrc': URLs[i], 'title': 'Testaillaaan' });
                    this.inputTrue = false;
                    this.animationStates[i] = 'hide';
                }
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/videos')) {
                    this.videoSources.push({ 'videosrc': URLs[i] });
                    this.inputTrue = false;
                    this.animationStates[i] = 'hide';
                }
                if (URLs[i].includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/audios')) {
                    this.audioSources.push({ 'audiosrc': URLs[i] });
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

    checkDeleteType(url) {
        if (url.includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
            return 'img';
        }
        if (url.includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/videos')) {
            return 'video';
        }
        if (url.includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/audios')) {
            return 'audio';
        }
    }

    deletePreview(url, id) {
        const idClass = this.checkDeleteType(url);
        document.getElementById('d' + idClass + id).remove();
        document.getElementById(idClass + 'Buttonrow' + id).remove();
        this.deletableURLs.push(url);
    }

    // Koko taidon poisto

    deleteCertificate() {
        this.cCollectionRef.delete().then(() => {
            this.closeModal();
        });
    }
    async confirmChanges() {
        const alert = await this.alertController.create({
            message: '<strong>Save Changes?</strong>',
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
                        this.saveChanges();
                    }
                }
            ]
        });
        await alert.present();
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
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const idIndex = this.pageData.downloadURLs.indexOf(url);
        console.log(idIndex);
        const fileid = this.pageData.files[idIndex];
        console.log(fileid);
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
        });

    }
    //// Vaihdettujen filujen päivitys tietokantaan/storageen

    uploadChange(sentFile) {
        console.log(sentFile);
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
        // this.percentage = this.task.percentageChanges();
        console.log('haloo2');
        this.snapshot = this.task.snapshotChanges().pipe(
            tap(snap => {
                if (snap.bytesTransferred === snap.totalBytes) {
                    // Update firestore on completion
                    console.log(this.data.user.uid);
                    this.afs.collection('files').add({ path, size: snap.totalBytes, sender: this.data.user.uid }).then((docRef) => {
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
            storageRef.child(path).getDownloadURL().then((url) => {
                // Or inserted into an <img> element:
                this.downloadURLs.push(url);
                console.log(url + ' DOWNLOADURL');
                this.afs.doc('files/' + this.filesid).update({ downloadURL: url });
                if (this.iCounter === (this.fileCount)) {
                    this.createPost();
                    console.log('CREATE POST');
                    setTimeout(() => {

                        this.closeModal();
                        console.log('closeModal!');
                    }, 1000);
                }
            }).catch(function (error) {
                // Handle any errors
            });


        }
        )).subscribe();
    }

    /////

    createPost() {
        const replaceindexes = [];
        for (let i = 0; i < this.downloadURLs.length; i++) {
            replaceindexes.push(this.pageData.downloadURLs.indexOf(this.oldURLs[i]));
        }
        for (let i = 0; i < this.downloadURLs.length; i++) {
            this.pageData.downloadURLs.splice(replaceindexes[i], 1, this.downloadURLs[i]);
            // voidaan EHKÄ käyttää replaceindexes-muuttujaa (riippuu kuinka huono modal.ts on)
            this.pageData.files.splice(replaceindexes[i], 1, this.fileids[i]);
        }
        console.log(this.fileids + ' upataanko mitä?');
        if (this.fileids.length === this.downloadURLs.length) {
            this.cCollectionRef.update({
                /*title: this.title,
                text: this.query,*/
                files: this.pageData.files,
                downloadURLs: this.pageData.downloadURLs,
                editDate: new Date()
            });
        }
    }
    changePreview(oldURL, id, type, event: FileList) {
        const file = event.item(0);
        this.files[this.fileCount] = file;
        this.oldURLs[this.fileCount] = oldURL;
        this.fileCount++;
        if (type === 'image/*') {
            const El = document.getElementById('img' + id);
            El.setAttribute('src', URL.createObjectURL(file));
        }
        if (type === 'video/*') {
            const El = document.getElementById('video' + id);
            El.setAttribute('src', URL.createObjectURL(file));
        }
        if (type === 'audio/*') {
            const El = document.getElementById('audio' + id);
            El.setAttribute('src', URL.createObjectURL(file));
        }
    }
    checkFileType(url) {
        if (url.includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/images')) {
            return 'image/*';
        }
        if (url.includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/videos')) {
            return 'video/*';
        }
        if (url.includes('https://firebasestorage.googleapis.com/v0/b/osaamisen-nayttaminen.appspot.com/o/audios')) {
            return 'audio/*';
        }
    }

    changeFile(url, id) {
        console.log(id);
        const type = this.checkFileType(url);
        const hiddenInput = document.createElement('input');
        hiddenInput.setAttribute('class', 'file-input');
        hiddenInput.setAttribute('type', 'file');
        hiddenInput.setAttribute('accept', type);
        hiddenInput.click();
        hiddenInput.onchange = (e: any) => {
            const file = e.target.files;
            this.changePreview(url, id, type, file);
        };
    }

    // Upload-napista tapahtuva tietojen lopullinen päivitys
    async saveChanges() {
        for (let i = 0; i < this.deletableURLs.length; i++) {

            this.deleteFile(this.deletableURLs[i]);
        }

        for (let i = 0; i < this.fileCount; i++) {
            await this.uploadChange(this.files[i]);
        }


    }
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
        this.fileCount = 0;
        this.iCounter = 0;
    }

}
