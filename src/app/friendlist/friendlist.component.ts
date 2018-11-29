import {
    Component, OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import {NavController, ModalController, Events, AlertController} from '@ionic/angular';
import {DataService} from '../services/data.service';
import {AngularFireStorage, AngularFireUploadTask} from 'angularfire2/storage';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {EditCardComponent} from '../edit-card/edit-card.component';
import * as firebase from 'firebase';
import 'firebase/firestore';

interface FriendRequest {
    sender: string;
    senderEmail: string;
    approved: boolean;
}

@Component({
    selector: 'app-friendlist',
    templateUrl: './friendlist.component.html',
    styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {

    friendRef;

    constructor(private nav: NavController,
                private modalController: ModalController,
                public data: DataService,
                private storage: AngularFireStorage,
                private afs: AngularFirestore,
                public events: Events,
                public alertController: AlertController) {
    }

    closeModal() {
        this.modalController.dismiss();
    }

    testButton(index) {
        console.log(this.data.friendRequests[0].sender);
        this.friendRef = this.afs.collection('users')
            .doc(this.data.user.uid)
            .collection('friends', ref => ref.where('sender', '==', this.data.friendRequests[index].sender)).ref
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    this.afs.collection('users').doc(this.data.user.uid).collection('friends').doc(doc.id).update({approved: true});
                });
            });
    }

    ngOnInit() {
        console.log(this.data.friendRequests[0].sender);
    }

}
