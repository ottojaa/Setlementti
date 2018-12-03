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
    userRef;
    receiverData;

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

    acceptFriendRequest(index) {
        console.log(index);
        console.log(this.data.friendRequests[index].sender);
        this.receiverData = this.data.allusers[index];
        this.friendRef = this.afs.collection('users')
            .doc(this.data.user.uid)
            .collection('friends', ref => ref.where('sender', '==', this.data.friendRequests[index].sender)).ref
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    this.afs.collection('users')
                        .doc(this.data.user.uid)
                        .collection('friends')
                        .doc(doc.id)
                        .update({approved: true});
                });
            });
        console.log(this.data.friendRequests[index]);
        this.userRef = this.afs.collection('users')
            .doc(this.data.friendRequests[index].sender)
            .collection('friends', ref => ref.where('receiver', '==', this.data.user.uid)).ref
            .get()
            .then(snapshot =>  {
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    this.afs.collection('users')
                        .doc(this.data.friendRequests[index].sender)
                        .collection('friends')
                        .doc(doc.id)
                        .update({pending: false, approved: true});
                });
        });
    }

    ngOnInit() {
        console.log(this.data.friendList);
        console.log(this.data.friendRequests);
        console.log(this.data.sentRequests);
        if (this.data.friendRequests[0]) {
            console.log(this.data.friendRequests[0].sender);
        }
        console.log(this.data.user.uid);
    }

}
