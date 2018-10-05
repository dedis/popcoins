import {Observable} from "data/observable";
import {Item} from "./shared/item";

let ZXing = require('nativescript-zxing');
let zx = new ZXing();
let ImageSource = require('image-source');


export class PartiesViewModel extends Observable {
    items: Array<Item>;

    constructor() {
        super();

        const qrcode = zx.createBarcode({
            encode: "test",
            format: ZXing.QR_CODE,
            height: 128,
            width: 128
        });

        this.items = new Array<Item>(
            {
                name: "Party #12",
                datetime: "Tuesday, 9th of October 2018",
                location: "BC229",
                status: "Get scanned",
                // qrcode: ''
                qrcode: ImageSource.fromNativeSource(qrcode)
            }
        );
    }
}
