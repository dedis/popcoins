import {EventData, Observable, topmost, View} from "ui/frame";
import { NavigatedData, Page } from "ui/page";
import { CouponsViewModel } from "./coupons-view-model";
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {fromObject} from "tns-core-modules/data/observable";
import * as dialogs from "tns-core-modules/ui/dialogs";

let lib = require("~/lib");
let Badge = lib.pop.Badge;
let Scan = lib.Scan;
let Convert = lib.Convert;
let RingSig = lib.crypto.RingSig;
let Coupon = lib.Coupon;
let FileIO = lib.FileIO;
let FilePaths = lib.FilePaths;
import Log from "~/lib/Log";
import {ItemEventData} from "tns-core-modules/ui/list-view";

let view:View = undefined;
let coupons: any[] = undefined;

export function onNavigatingTo(args: NavigatedData) {
    view = <View>args.object;

    view.bindingContext = fromObject({
        items: new ObservableArray()
    });
    return updateCoupons();
}

export function onBack(){
    topmost().goBack();
}

function updateCoupons(){
    view.bindingContext.items.splice(0);
    coupons = [];
    return FileIO.forEachFolderElement(FilePaths.COUPON_PATH, function (barFolder) {
        let c = new Coupon(barFolder.name);
        coupons.push(c);
        // Observables have to be nested to reflect changes
        view.bindingContext.items.push(fromObject({
            bar: c,
            desc: c.getConfigModule(),
        }));
    });
}

export function addCoupon(args: EventData) {
    const parties = Object.values(Badge.List);
    if (parties.length == 0){
        return dialogs.alert("Please get a badge first.");
    }
    return Scan.scan()
        .then(resultJSON => {
            const conf = Convert.jsonToObject(resultJSON);
            return Coupon.createWithConfig(conf.name, conf.frequency, new Date(+conf.date), parties[0])
        })
        .then(()=>{
            updateCoupons();
        })
        .catch(err =>{
            Log.catch(err);
        })
}

export function couponTapped(args: ItemEventData){
    let c = coupons[args.index];
    const actionRequest = "Request the good";
    const actionDelete = "Delete the coupon";
    return dialogs.action({
        message: "How to use your coupon?",
        cancelButtonText: "Cancel",
        actions: [actionRequest, actionDelete]
    }).then(result =>{
        switch(result){
            case actionRequest:
                const parties = Object.values(Badge.List);
                if (parties.length == 0){
                    return dialogs.alert("Please get a badge first.");
                }
                // const sigData = Convert.jsonToObject(resultJSON);

                const msg = c.getSigningData();
                const sig = RingSig.SignWithBadge(parties[0], msg.nonce, msg.scope);

                const fields = {
                    signature: Convert.byteArrayToHex(sig),
                    nonce: Convert.byteArrayToHex(msg.nonce)
                };
                return view.page.showModal("pages/common/qr-code/qr-code-page", {
                    textToShow: Convert.objectToJson(fields),
                    title: "Signed informations"
                }, ()=>{}, true);
            case actionDelete:
                return c.remove()
                    .then(()=>{
                        updateCoupons();
                    });
        }
    })
        .catch(err=>{
            Log.catch(err);
            return dialogs.alert("Something went wrong: " + err);
        })
}