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

    startobs = this.startAt.asObservable();
    endobs = this.endAt.asObservable();
    results = new Array();
    user;


    constructor(private afs: AngularFirestore, private db: AngularFireDatabase) {
    }
    getFriendRequests() {
        return this.afs.collection('users')
            .doc(this.user.uid)
            .collection('friends', ref => ref.where('approved', '==', false)).valueChanges();
    }
    getFriendList() {
        return this.afs.collection('users')
            .doc(this.user.uid)
            .collection('friends', ref => ref.where('approved', '==', true)).valueChanges();
    }

    getUsers(start, end) {
        return this.afs.collection('users', ref => ref.orderBy('nickName').startAt(start).endAt(end)).valueChanges();
    }

    getAllUsers() {
        return this.afs.collection('users', ref => ref.orderBy('nickName')).valueChanges();
    }
}

