"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = require("data/observable");
let ZXing = require('nativescript-zxing');
let zx = new ZXing();
let ImageSource = require('image-source');
exports.model = observable_1.fromObject({
    items: Array({
        name: "name",
        datetime: "datetime",
        location: "location",
        status: "Get scanned",
        qrcode: "something"
    }),
    party: undefined
});
function showParty(party) {
    const qrcode = zx.createBarcode({
        encode: "test",
        format: ZXing.QR_CODE,
        height: 128,
        width: 128
    });
    exports.model.notifyPropertyChange("items", Array({
        name: party.config.name,
        datetime: party.config.datetime,
        location: party.config.location,
        status: "Get scanned",
        qrcode: party.qrcodePublic()
    }));
    exports.model.set("party", party);
}
exports.showParty = showParty;
