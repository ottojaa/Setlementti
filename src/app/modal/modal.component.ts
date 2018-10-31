import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {DataService} from '../services/data.service';


@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
    title;
    query;
    inputTrue;

    constructor(private nav: NavController, private modalController: ModalController, public data: DataService) {
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
    }

}
