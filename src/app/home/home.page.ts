import { Component} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import {DataService} from '../services/data.service';
import 'firebase/firestore';
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {
    private params = {};
    title;
    inputTrue = false;
    lista = [];
    listPart = this.lista[0];
    constructor(public modalController: ModalController, public data: DataService) {

    }

    async presentModal() {
        const modal = await this.modalController.create({
            component: ModalComponent,
            componentProps: { value: 123 }
        });
        return await modal.present();
    }
    setInput() {
        this.inputTrue = true;
    }
}
