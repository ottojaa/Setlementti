import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {DataService} from '../services/data.service';
import {AngularFireStorage, AngularFireUploadTask} from 'angularfire2/storage';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {tap} from 'rxjs/operators';
import {finalize} from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {HttpClient} from '@angular/common/http';

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

    // Progress monitoring
    percentage: Observable<number>;

    snapshot: Observable<any>;

    // Download URL
    downloadURL: Observable<string>;

    // State for dropzone CSS toggling
    isHovering: boolean;

    constructor(private nav: NavController, private modalController: ModalController, public data: DataService,
                private storage: AngularFireStorage, private db: AngularFirestore) {
    }

    upload(): void {
        this.uploadFiles = this.uploadFiles === 'out' ? 'in' : 'out';
    }

    toggleHover(event: boolean) {
        this.isHovering = event;
    }

    startUpload(event: FileList) {
        // The File object
        const file = event.item(0);

        // Client-side validation example
        if (file.type.split('/')[0] !== 'image') {
            console.error('unsupported file type :( ');
            return;
        }

        // The storage path
        const path = `test/${new Date().getTime()}_${file.name}`;

        // Totally optional metadata
        const customMetadata = {app: 'My AngularFire-powered PWA!'};

        // The main task
        this.task = this.storage.upload(path, file, {customMetadata});

        // Progress monitoring
        this.percentage = this.task.percentageChanges();
        this.snapshot = this.task.snapshotChanges().pipe(
            tap(snap => {
                if (snap.bytesTransferred === snap.totalBytes) {
                    // Update firestore on completion
                    this.db.collection('photos').add({path, size: snap.totalBytes});
                }
            })
        );

        // The file's download URL
        this.snapshot.pipe(finalize(() => this.downloadURL = this.storage.ref(path).getDownloadURL())).subscribe();
    }

    isActive(snapshot) {
        return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
    }


    update() {
        this.data.currentTime = Date.now();
        this.data.results.push({'title': this.title, 'text': this.query});
        this.inputTrue = false;
        this.modalController.dismiss();
        console.log(this.data.results);
    }

    closeModal() {
        this.modalController.dismiss();
    }

    ngOnInit() {
        this.uploadFiles = 'out';
    }

}
