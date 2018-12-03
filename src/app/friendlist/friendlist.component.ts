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
import 'rxjs/add/operator/mergeMap';
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
        console.log(this.data.friendRequests[index].sender);
        this.friendRef = this.data.friendRequests[index].sender;
        this.receiverData = this.data.allusers[index];

        // Searches for the correct document from your subcollection "friends" and updates it

        const query = this.afs.collection('users')
            .doc(this.data.user.uid)
            .collection('friends', ref => ref
                .where('sender', '==', this.data.friendRequests[index].sender));
        query.snapshotChanges().map(changes => {
            changes.map(a => {
                const id = a.payload.doc.id;
                console.log(a.payload.doc.data());
                this.afs.collection('users')
                    .doc(this.data.user.uid)
                    .collection('friends')
                    .doc(id).update({approved: true});
            });
        }).subscribe();

        // Updates the friend request in the recipient's collection as well.

        const querySelf = this.afs.collection('users')
            .doc(this.friendRef)
            .collection('friends', ref => ref
                .where('receiver', '==', this.data.user.uid));
        querySelf.snapshotChanges().map(changes => {
            changes.map(a => {
                const id = a.payload.doc.id;
                console.log(a.payload.doc.data());
                this.afs.collection('users')
                    .doc(this.friendRef)
                    .collection('friends')
                    .doc(id).update({approved: true});
            });
        }).subscribe();
        /*this.userRef = this.afs.collection('users')
             .doc(this.data.friendRequests[index].sender)
             .collection('friends', ref => ref
                 .where('sentByYou', '==', false)
                 .where('receiver', '==', this.data.user.uid).limit(1))
             .valueChanges()
             .flatMap(result => result);
        console.log(this.userRef.sender);*/
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
