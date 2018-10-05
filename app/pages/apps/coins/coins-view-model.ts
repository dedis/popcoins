import { Observable } from "data/observable";

let ZXing = require('nativescript-zxing');
let zx = new ZXing();
let ImageSource = require('image-source');

export class CoinsViewModel extends Observable {
    balance: number;
    qrcode: any;

    constructor() {
        super();

        const qrcodeZX = zx.createBarcode({
            encode: "test",
            format: ZXing.QR_CODE,
            height: 128,
            width: 128
        });

        this.balance = 100000;
        this.qrcode = ImageSource.fromNativeSource(qrcodeZX);
    }
}
