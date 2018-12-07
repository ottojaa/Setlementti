import {
    Component, OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import {NavController, ModalController, Events, AlertController} from '@ionic/angular';
import {DataService} from '../services/data.service';
import {AngularFireStorage, AngularFireUploadTask} from 'angularfire2/storage';
import {AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {tap} from 'rxjs/operators';
import {finalize} from 'rxjs/operators';
import {trigger, state, style, animate, transition} from '@angular/animations';
import * as firebase from 'firebase/app';

require('firebase/auth');
import {HttpClient} from '@angular/common/http';
import {stringify} from '@angular/core/src/render3/util';
import {Certificate} from 'tls';

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
                width: '*'
            })),
            state('out', style({
                opacity: '0',
                overflow: 'hidden',
                height: '0',
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
    uploading = 'in';
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
    imageUrls = [];
    mentorTrue;
    mentorArray;
    friends;
    random;
    multimedia = [];

    // Itse uploadiin merkityksettömät counterit, jotka ovat vain osa spagettia vanhan spagettisekoilun korjaamiseksi
    multimediaCounter = 0;
    imageCounter = 0;

    constructor(private nav: NavController,
                private modalController: ModalController,
                public data: DataService,
                private storage: AngularFireStorage,
                private db: AngularFirestore,
                public events: Events,
                private alertController: AlertController) {
    }

    async showAlert() {

        const alert = await this.alertController.create({
            message: 'Cannot upload more than 4 images'
        });
        await alert.present();
        setTimeout(() => {
            alert.dismiss();
        }, 2000);
    }

    upload(): void {
        this.uploadFiles = this.uploadFiles === 'out' ? 'in' : 'out';
        this.uploading = this.uploading === 'out' ? 'in' : 'out';
    }

    toggleHover(event: boolean) {
        this.isHovering = event;
    }


    makeVideoPreview() {
        if (this.multimedia.length < 1) {
        const video = document.createElement('video');
        const parent = document.getElementById('videoContainer');
        parent.style.height = 'auto';
        parent.parentNode.insertBefore(video, parent.nextSibling);
        video.setAttribute('controls', '');
        video.setAttribute('style', 'max-height: 200px');
        const source = document.createElement('source');
        video.appendChild(source);
        source.setAttribute('src', URL.createObjectURL(this.file));
        video.id = 'media' + this.multimedia.length.toString();
        this.createPreviewDelete(video, video);
        }
        if (this.multimedia.length >= 1) {
            const video = document.createElement('video');
        const parent = document.getElementById('videoContainer');
        this.fileCounter++;
        this.multimediaCounter++;
        parent.style.height = 'auto';
        parent.parentNode.insertBefore(video, parent.nextSibling);
        video.setAttribute('controls', '');
        video.setAttribute('style', 'max-height: 200px');
        const source = document.createElement('source');
        video.appendChild(source);
        source.setAttribute('src', URL.createObjectURL(this.file));
        video.id = 'media' + this.multimedia.length.toString();
        }
        this.multimedia.push(URL.createObjectURL(this.file));
    }

    makeAudioPreview() {
        if (this.multimedia.length < 1) {
        const audio = document.createElement('audio');
        const parent = document.getElementById('audioContainer');
        parent.style.height = 'auto';
        parent.parentNode.insertBefore(audio, parent.nextSibling);
        audio.setAttribute('controls', '');
        const source = document.createElement('source');
        audio.appendChild(source);
        audio.id = 'media' + this.multimedia.length.toString();
        source.setAttribute('src', URL.createObjectURL(this.file));
        this.createPreviewDelete(audio, audio);
    }
    if (this.multimedia.length >= 1) {
        const audio = document.createElement('audio');
        const parent = document.getElementById('audioContainer');
        this.fileCounter++;
        this.multimediaCounter++;
        parent.style.height = 'auto';
        parent.parentNode.insertBefore(audio, parent.nextSibling);
        audio.setAttribute('controls', '');
        const source = document.createElement('source');
        audio.appendChild(source);
        audio.id = 'media' + this.multimedia.length.toString();
        source.setAttribute('src', URL.createObjectURL(this.file));
    }
    this.multimedia.push(URL.createObjectURL(this.file));
    }
    async makeImgPreview() {
        if (this.imageUrls.length < 1) {
            const img = document.createElement('img');
            img.className = 'big';
            const parent = document.getElementById('imagecontainer');
            parent.style.height = 'auto';
            parent.appendChild(img);
            img.id = this.imageUrls.length.toString();
            img.setAttribute('src', URL.createObjectURL(this.file));
            this.createPreviewDelete(img, img);
        }
        if (this.imageUrls.length >= 1 && this.imageUrls.length < 4) {
            const img = document.createElement('img');
            img.className = 'small';
            this.fileCounter++;
            this.imageCounter++;
            const parent = document.getElementById('smallerimages');
            parent.style.height = 'auto';
            parent.appendChild(img);
            img.id = this.imageUrls.length.toString();
            img.setAttribute('src', URL.createObjectURL(this.file));
            img.addEventListener('click', (e) => {
                const ident = <HTMLTextAreaElement>e.target;
                console.log('Click image ID', '=>', parseFloat(ident.id));
                this.swapSources(parseFloat(ident.id));
            });
        }
        if (this.imageUrls.length >= 4) {
            this.showAlert();
        }
        if (this.imageUrls.length < 4) {
            this.imageUrls.push(URL.createObjectURL(this.file));
        }
        console.log(this.imageUrls);
        this.imagePreview = true;
    }

    createPreviewDelete(sibling, deletable) {
        const deleteButton = document.createElement('ion-button');
        deleteButton.className = 'deletebutton';
        const icon = document.createElement('ion-icon');
        deleteButton.appendChild(icon);

        icon.setAttribute('name', 'close');
        sibling.parentNode.insertBefore(deleteButton, sibling.nextSibling);
        const deletableFile = this.imageCounter;
        console.log('Delete this index' + deletableFile);
        const deletableInput = this.inputsN;
        console.log(this.fileCounter);
        const deletableMultimedia = this.multimediaCounter;
        console.log('Delete this media' + deletableMultimedia);
        this.fileCounter++;
        const tag = sibling.tagName.toString();
        console.log(tag);
        if (tag === 'IMG') {
            this.imageCounter++;
            deleteButton.id = 'delete';
        deleteButton.addEventListener('click', () => {
            this.deleteInput(deletableFile, deletableInput);
        });
    } else {
        this.multimediaCounter++;
        console.log('poistetaan video/ääni');
        deleteButton.id = 'deletemulti';
        deleteButton.addEventListener('click', () => {
            this.deleteInputmedia(deletableMultimedia, deletableInput);
        });
    }
    }

    swapSources(index) {
        const stringified = index.toString();
        const largeImage = document.getElementById('0');
        const smallImage = document.getElementById(stringified);
        largeImage.setAttribute('src', this.imageUrls[index]);
        smallImage.setAttribute('src', this.imageUrls[0]);
        [this.imageUrls[0], this.imageUrls[index]] = [this.imageUrls[index], this.imageUrls[0]];
    }

    async deleteInput(index, inputN) {
        this.fileCounter--;
        this.imageCounter--;
        this.inputsN = this.inputsN - 1;
        if (this.imageUrls.length <= 1) {
            console.log(index);
            document.getElementById((index).toString()).remove();
            document.getElementById('delete').remove();
            this.imageUrls.splice(0, 1);
        }
        if (this.imageUrls.length > 1) {
            for (let i = 0; i < this.imageUrls.length; i++) {
                if (i < this.imageUrls.length - 1) {
                    document.getElementById(i.toString()).setAttribute('src', this.imageUrls[i + 1]);
                    console.log(i);
                    console.log(this.imageUrls.length);
                } else {
                    document.getElementById(i.toString()).remove();
                    this.imageUrls.splice(0, 1);
                }
            }
        }
    }

    async deleteInputmedia(index, inputN) {
        this.fileCounter--;
        this.multimediaCounter--;
        console.log(index + ' index');
        console.log(this.fileCounter + ' fileCounter');
        console.log(this.multimedia.length + ' multimedia pituus');
        console.log(this.multimedia + ' multimedia');
        this.inputsN = this.inputsN - 1;
        console.log(document.getElementById('media' + (index).toString()) + '  ' + document.getElementById('delete'));
        if (this.multimedia.length <= 1) {
            document.getElementById('deletemulti').remove();
            document.getElementById('media' + (index).toString()).remove();
            this.multimedia.splice(0, 1);
        }
        if (this.multimedia.length > 1) {
            for (let i = 0; i < this.multimedia.length; i++) {
                if (i < this.multimedia.length - 1) {
                    const element = document.getElementById('media' + i.toString());
                    console.log(element);
                    element.querySelector('source').setAttribute('src', this.multimedia[i + 1]);
                    console.log(i);
                    console.log(this.multimedia.length);
                } else {
                    document.getElementById('media' + i.toString()).remove();
                    this.multimedia.splice(0, 1);
                }
            }

        }

    }

    createNewinput() {
        this.inputsN++;
    }

    // Määritetään uploadfilu ja tehdään uusi input
    async defineUpload(event: FileList) {
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
        const customMetadata = {app: 'My AngularFire-powered PWA!'};

        // The main task
        this.task = this.storage.upload(path, sentFile, {customMetadata});

        // Progress monitoring
        this.percentage = this.task.percentageChanges();
        console.log('haloo2');
        this.snapshot = this.task.snapshotChanges().pipe(
            tap(snap => {
                if (snap.bytesTransferred === snap.totalBytes) {
                    // Update firestore on completion
                    console.log(this.data.user.uid);
                    this.db.collection('files').add({path, size: snap.totalBytes, sender: this.data.user.uid}).then((docRef) => {
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
                    this.db.doc('files/' + this.filesid).update({downloadURL: url});
                    if (this.iCounter === (this.inputsN - 1)) {
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
        this.data.results.push({'title': this.title, 'text': this.query});
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
        /*this.approved();*/
        // this.getMentors();
    }

// päivityksiä
    /*approved() {
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
    }*/


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
        if (this.mentorTrue === false) {
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
