import {View} from "ui/core/view";
import {ItemEventData} from "ui/list-view";
import {Item} from "./shared/item";
import {NavigatedData, Page} from "ui/page";
import {BadgesViewModel} from "./badges-view-model";
import * as Dialog from "tns-core-modules/ui/dialogs";
import {topmost} from "tns-core-modules/ui/frame";

let lib = require("../../lib");
let Badge = lib.pop.Badge;
let Log = lib.Log.default;
let Scan = lib.Scan;
let Convert = lib.Convert;
let RingSig = lib.crypto.RingSig;

let page: Page = undefined;
let pageObject = undefined;

const USER_CANCELED = "Cancel";

function convertBinaryStringToUint8Array(bStr) {
    let len = bStr.length, u8_array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        u8_array[i] = bStr.charCodeAt(i);
    }
    return u8_array;
}

export function onNavigatingTo(args: NavigatedData) {
    Log.print("getting to badges");
    page = <Page>args.object;
    page.bindingContext = new BadgesViewModel();
    Log.print("isempty:", page.bindingContext.isEmpty);
    return loadParties();
}

function loadParties() {
    Log.lvl1("Loading parties");
    return Badge.Badge.loadAll()
        .then(badges=>{
            return Badge.Badge.updateAll();
        })
        .then(badges => {
            page.bindingContext.isEmpty = true;
            Object.values(badges).forEach((badge:any, index:number) => {
                Log.print("Found badge with state:", badge.state());
                if (badge.state() == Badge.STATE_TOKEN) {
                    page.bindingContext.items.push({
                        party: badge,
                        name: badge.config.name,
                        datetime: badge.config.datetime,
                        location: badge.config.location,
                        index: index + 1
                    })
                    page.bindingContext.isEmpty = false;
                }
            });
        })
        .catch(err => {
            Log.catch(err);
        });
}

export function partyTapped(args) {
    const index = args.index;
    const party = page.bindingContext.items[index].party;

    const WALLET_DELETE = "Delete";
    const WALLET_SHOW = "Show";
    const WALLET_SIGN = "Sign service";

    let actions = [WALLET_SHOW, WALLET_DELETE];
    Log.print("State is:", party.state());
    if (party.state() == Badge.STATE_TOKEN) {
        actions.unshift(WALLET_SIGN);
        // actions.unshift(WALLET_TRANSFER, WALLET_SIGN)
    }
    // return topmost().getViewById("listView").refresh()
    return Dialog.action({
        message: "Choose an Action",
        cancelButtonText: "Cancel",
        actions: actions
    }).then(result => {
        switch (result) {
            case WALLET_DELETE:
                Dialog.confirm({
                    title: "Deleting party-token",
                    message: "You're about to delete the party-token - \n" +
                        "are you sure?",
                    okButtonText: "Yes, delete",
                    cancelButtonText: "No, keep"
                })
                    .then(del => {
                        if (del) {
                            return party.remove()
                                .then(() => {
                                    page.bindingContext.items.splice(index, 1);
                                    return pageObject.getViewById("listView").refresh();
                                })
                        }
                    })
                    .catch(err => {
                        console.log("error while deleting:", err);
                    })
            case WALLET_SHOW:
                return topmost().navigate({
                    moduleName: "drawers/pop/org/config/config-page",
                    context: {
                        wallet: party,
                        readOnly: true
                    }
                });
            case WALLET_SIGN:
                return Scan.scan()
                    .then(signDataJson => {
                        const sigData = Convert.jsonToObject(signDataJson);
                        const sig = RingSig.signWithPopToken(party.getPopToken(),
                            Convert.hexToByteArray(sigData.nonce), Convert.hexToByteArray(sigData.scope));

                        const fields = {
                            signature: Convert.byteArrayToHex(sig)
                        };

                        return pageObject.showModal("shared/pages/qr-code/qr-code-page", {
                            textToShow: Convert.objectToJson(fields),
                            title: "Signed informations"
                        });
                    })
                    .catch(error => {
                        console.log("couldn't scan:", error);

                        if (error !== Scan.SCAN_ABORTED) {
                            return Dialog.alert({
                                title: "Error",
                                message: "An error occured, please retry. - " + error,
                                okButtonText: "Ok"
                            });
                        }

                    });
        }
    });
}

function update() {
    pageObject.getViewById("listView").refresh();
}
