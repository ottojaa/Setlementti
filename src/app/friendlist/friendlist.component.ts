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

@Component({
    selector: 'app-friendlist',
    templateUrl: './friendlist.component.html',
    styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {

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

    testButton() {

    }

    ngOnInit() {
        console.log(this.data.friendRequests);
    }

}
