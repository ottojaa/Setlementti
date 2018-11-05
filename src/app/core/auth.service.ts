import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Observable, of } from 'rxjs';
import { switchMap} from 'rxjs/operators';
import 'rxjs/add/operator/switchMap'
import { auth } from 'firebase/app';

interface User {
  uid:string;
  email: string;
  photoURL?: string;
  displayName?: string;
  favoriteColor?: string;
  
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<User>;


  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router) {

      this.user = this.afAuth.authState
      .switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
        } else {
          return of(null)
        }
      })
     }

     googleLogin() {
       const provider = new firebase.auth.GoogleAuthProvider()
       return this.oAuthLogin(provider);
     }

     private oAuthLogin(provider) {
       return this.afAuth.auth.signInWithPopup(provider)
       .then((credential) => {
         this.updateUserData(credential.user)
       })
     }

     private updateUserData(user) {
       // Sets user data to firestore on login

       const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }

    return userRef.set(data, { merge: true })

  }


  signOut() {
    this.afAuth.auth.signOut().then(() => {
        this.router.navigate(['/']);
    });
  }
}
