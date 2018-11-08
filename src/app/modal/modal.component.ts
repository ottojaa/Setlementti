import {Component, OnInit,
    ElementRef,
    ViewChild } from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {DataService} from '../services/data.service';
import {AngularFireStorage, AngularFireUploadTask} from 'angularfire2/storage';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {tap} from 'rxjs/operators';
import {finalize} from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {HttpClient} from '@angular/common/http';
import { stringify } from '@angular/core/src/render3/util';

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
    task: AngularFireUploadTask;
    @ViewChild('canvas') canvasEl : ElementRef;
    @ViewChild('#tableBanner') previewImg : ElementRef;

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
    //private _CANVAS  : any;



    /**
    * Reference the context for the Canvas element
    */
    //private _CONTEXT : any;
  

    constructor(private nav: NavController, private modalController: ModalController, public data: DataService,
                private storage: AngularFireStorage, private db: AngularFirestore) {
    }

    upload(): void {
        this.uploadFiles = this.uploadFiles === 'out' ? 'in' : 'out';
    }

    toggleHover(event: boolean) {
        this.isHovering = event;
    }
    file: any//                            HUOMIO HUOMIO
    // Määritetään uploadfilu ja piilotetaan input
    defineUpload(event: FileList) {
        this.file = event.item(0);
        console.log(this.file);
        this.uploadFiles = this.uploadFiles === 'in' ? 'out' : 'in';
        //localStorage.setItem('file', this.file);
        
        let img = document.getElementById('tableBanner');
        console.log(this.file.name);
        console.log("tän jälkee tulee");
        //console.log(localStorage.getItem('file'));
        //TÄHÄN PITÄS SAADA OIKEA SYNTAKSI
        img.setAttribute('src', URL.createObjectURL(this.file));
       // this.drawPreview(img)
    }
    // Kanvakseen preview
    /*drawPreview(preview) {
        this._CANVAS = this.canvasEl.nativeElement;
        this._CANVAS.width = preview.width;
        this._CANVAS.height = preview.height;

        this._CANVAS.getContext("2d").drawImage(preview, 0, 0);
    }*/
    //Upataan annettu parametri ja suljetaan modaali
    async startUpload(sentFile/*event: FileList*/) {
        // The File object
        //const file = event.item(0);
        console.log(sentFile);
        // Tiedostotyyppi
        if ((sentFile.type.split('/')[0] !== 'image' )&&( sentFile.type.split('/')[0] !== 'video' )&&( sentFile.type.split('/')[0] !== 'audio')) {
            console.error('unsupported file type :( ');
            return;
        }
        let finished = 0;
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
        console.log("haloo2")
        this.snapshot = this.task.snapshotChanges().pipe(
            tap(snap => {
                if (snap.bytesTransferred === snap.totalBytes) {
                    // Update firestore on completion
                    this.db.collection('photos').add({path, size: snap.totalBytes});
                    console.log("haloo1")
                    this.closeModal();
                }
            })
        );

        // The file's download URL
        this.snapshot.pipe(finalize(() => this.downloadURL = this.storage.ref(path).getDownloadURL())).subscribe();
        
        
        
    }

    isActive(snapshot) {
        return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
    }

    // File Upataan vasta updaten yhteydessä määritetyllä parametrillä
    async update() {
        if (this.file) {
        await this.startUpload(this.file)
        }
        this.data.currentTime = Date.now();
        this.data.results.push({'title': this.title, 'text': this.query});
        this.inputTrue = false;
        //this.closeModal();
        console.log(this.data.results);
    }

    closeModal() {
        this.modalController.dismiss();
    
    }

    ngOnInit() {
        this.uploadFiles = 'out';
    }

}
