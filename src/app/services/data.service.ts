import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    currentTime;
    results = new Array();
    user;
    userInfo = new Array();

    constructor() {
    }
}
