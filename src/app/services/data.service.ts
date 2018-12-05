import {Injectable} from '@angular/core';
import 'rxjs/add/operator/switchMap';
import {AngularFireDatabase} from 'angularfire2/database';
import {Subject} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Observable} from 'rxjs';

interface Users {
    nickName: string;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class DataService {
    searchterm: string;

    startAt = new Subject();
    endAt = new Subject();
    users;
    allusers;
    currentTime;
    friendList;
    friendRequests;
    sentRequests;
    profilePicture;
    client;
    clientCertificate;

    startobs = this.startAt.asObservable();
    endobs = this.endAt.asObservable();
    results = new Array();
    user;


    constructor(private afs: AngularFirestore, private db: AngularFireDatabase) {
    }

    getFriendRequests() {
        return this.afs.collection('users')
            .doc(this.user.uid)
            .collection('friends', ref => ref
                .where('sentByYou', '==', false)
                .where('approved', '==', false))
            .valueChanges();
    }

    getFriendList() {
        return this.afs.collection('users')
            .doc(this.user.uid)
            .collection('friends', ref => ref.where('approved', '==', true)).valueChanges();
    }

    getSentRequests() {
        return this.afs.collection('users')
            .doc(this.user.uid)
            .collection('friends', ref => ref
                .where('sentByYou', '==', true)
                .where('approved', '==', false))
            .valueChanges();
    }

    getUsers(start, end) {
        return this.afs.collection('users', ref => ref.startAt(start).endAt(end)).valueChanges();
    }

    getAllUsers() {
        return this.afs.collection('users', ref => ref).valueChanges();
    }

   /* getClient(index) {
        return this.afs.collection('friends', ref => ref.where('approved', '==', true)).valueChanges();
    }*/

    // Yritys saada firestore jättämään hakija pois hakutuloksista (firestoressa ei ole != operaattoria nii meni vähän turhan säädöks)

    /*getUsers(start, end) {

        const userCollection = [];
        const users = this.afs.collection('users', ref => ref
            .where('senderEmail', '<', this.user.email)
            .orderBy('senderEmail').startAt(start).endAt(end)).valueChanges();
        users.forEach((user => {
            userCollection.push(user.data());
        }));
        const usersCombined = this.afs.collection('users', ref => ref
            .where('senderEmail', '<', this.user.email)
            .orderBy('senderEmail').startAt(start).endAt(end)).valueChanges();
        usersCombined.forEach((user => {
            userCollection.push(user.data());
        }));
        console.log(userCollection);
        return userCollection;
    }

    getAllUsers() {
        const userCollection = [];
        const users = this.afs.collection('users', ref => ref
            .where('senderEmail', '>', this.user.email)
            .orderBy('senderEmail')).valueChanges();
        users.forEach((user => {
            userCollection.push(user.data());
        }));
        const usersCombined = this.afs.collection('users', ref => ref
            .where('senderEmail', '>', this.user.email)
            .orderBy('senderEmail')).valueChanges();
        usersCombined.forEach((user => {
            userCollection.push(user.data());
        }));
        console.log(userCollection);
        return userCollection;
    }*/
}

