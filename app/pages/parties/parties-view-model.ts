import {fromObject, Observable} from "data/observable";
import {Item} from "./shared/item";
import {Badge} from "~/lib/pop/Badge";
import Log from "~/lib/Log";

let ZXing = require('nativescript-zxing');
let zx = new ZXing();
let ImageSource = require('image-source');

export let model = fromObject({
    items: Array<Item>({
        name: "name",
        datetime: "datetime",
        location: "location",
        status: "Get scanned",
        qrcode: "something"
    }),
    party: undefined
});

export function showParty(party: Badge) {
    const qrcode = zx.createBarcode({
        encode: "test",
        format: ZXing.QR_CODE,
        height: 128,
        width: 128
    });

    model.notifyPropertyChange("items", Array<Item>({
        name: party.config.name,
        datetime: party.config.datetime,
        location: party.config.location,
        status: "Get scanned",
        qrcode: party.qrcodePublic()
    }));
    model.set("party", party);
}
exports.showParty = showParty;
