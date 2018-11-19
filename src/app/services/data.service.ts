import {Injectable} from '@angular/core';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/switchMap';
import {Upload} from '../profile/upload';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import {AngularFirestore} from 'angularfire2/firestore';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    currentTime;
    results = new Array();
    user;
    userInfo = new Array();
    collection;


    constructor(private af: AngularFirestore, private db: AngularFireDatabase) {
    }

    private basePath = '/uploads';
    uploads: firebase.storage.UploadTask;

    pushUpload(upload: Upload) {
        const storageRef = firebase.storage().ref();
        const uploadTask = storageRef.child(`${this.basePath}/${upload.file.name}`).put(upload.file);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                // upload in progress
               console.log('uploaded succesfully');
            },
            (error) => {
                // upload failed
                console.log(error);
            },
            () => {
                // upload success
                upload.url = uploadTask.snapshot.downloadURL;
                upload.name = upload.file.name;
                this.saveFileData(upload);
            }
        );
    }
    private saveFileData(upload: Upload) {
        this.db.list(`${this.basePath}/`).push(upload);
    }
    deleteUpload(upload: Upload) {
        this.deleteFileData(upload.$key)
            .then( () => {
                this.deleteFileStorage(upload.name);
            })
            .catch(error => console.log(error));
    }

    // Deletes the file details from the realtime db
    private deleteFileData(key: string) {
        return this.db.list(`${this.basePath}/`).remove(key);
    }

    // Firebase files must have unique names in their respective storage dir
    // So the name serves as a unique key
    private deleteFileStorage(name: string) {
        const storageRef = firebase.storage().ref();
        storageRef.child(`${this.basePath}/${name}`).delete();
    }
}

