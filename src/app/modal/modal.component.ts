import {
    Component, OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import {NavController, ModalController, Events} from '@ionic/angular';
import {DataService} from '../services/data.service';
import {AngularFireStorage, AngularFireUploadTask} from 'angularfire2/storage';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {tap} from 'rxjs/operators';
import {finalize} from 'rxjs/operators';
import {trigger, state, style, animate, transition} from '@angular/animations';
import * as firebase from 'firebase/app';

require('firebase/auth');
import {HttpClient} from '@angular/common/http';
import {stringify} from '@angular/core/src/render3/util';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
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
        // this.drawPreview(img)
        this.createPreviewDelete(img, img);
    }

    createPreviewDelete(sibling, deletable) {
        const deleteButton = document.createElement('ion-button');
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
        const outerlabel = document.querySelector('.file-label');
        this.inputsN++;
        const input = document.createElement('input');
        const inputlabel = document.createElement('ion-label');

        inputlabel.setAttribute('id', 'input' + this.inputsN);
        inputlabel.setAttribute('class', 'file-label');
        outerlabel.parentNode.insertBefore(inputlabel, outerlabel.nextSibling);
        input.setAttribute('class', 'file-input');
        input.setAttribute('type', 'file');
        // input.setAttribute('(change)', 'defineUpload($event.target.files)');
        // input.setAttribute('id', 'input'+this.inputsN);
        input.onchange = (e: any) => {
            const files = e.target.files;
            this.defineUpload(files);
        };
        inputlabel.appendChild(input);
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

    // Kanvakseen preview
    /*drawPreview(preview) {
        this._CANVAS = this.canvasEl.nativeElement;
        this._CANVAS.width = preview.width;
        this._CANVAS.height = preview.height;

        this._CANVAS.getContext("2d").drawImage(preview, 0, 0);
    }*/


    // Upataan annettu parametri ja suljetaan modaali

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
                    }).then(() => {
                        console.log('haloo1');
                        this.iCounter++;
                        if (this.iCounter === (this.inputsN - 1)) {

                            setTimeout(() => {
                                this.createPost();
                                this.closeModal();
                                console.log('closeModal!');
                            }, 200);
                        }
                    });

                }
            })
        );

        // The file's download URL
        this.snapshot.pipe(finalize(() => this.downloadURL = this.storage.ref(path).getDownloadURL())).subscribe();


    }

    isActive(snapshot) {
        return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
    }

    // Tallennetaan itse postaus tietokantaan

    createPost() {
        // let fileIdCollection = this.db.collection<Files>('files');
        // const header = document.getElementById('header').value;
        // Luodaan firebase-collection: certificates ja tallennetaan sinne otsikko, teksti, tiedostojen Id:t, tekijä, pvm
        this.db.collection('certificates').add({
            title: this.title,
             text: this.query,
              files: this.fileids,
               author: this.data.user.uid,
                date: new Date()});
    }

    // File Upataan vasta updaten yhteydessä määritetyllä parametrillä
    async update() {
        if (this.files.lenght > 0) {
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
        this.fileids = [];
        this.files = [];
        this.fileCounter = 0;
        this.inputsN = 1;
        this.uploadFiles = 'out';
        this.iCounter = 0;
    }

}
