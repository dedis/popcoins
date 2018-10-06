import { Observable } from "data/observable";

let ZXing = require('nativescript-zxing');
let zx = new ZXing();
let ImageSource = require('image-source');

export class AdminViewModel extends Observable {
    prop: number;

    constructor() {
        super();
        this.prop = 2;
    }
}
