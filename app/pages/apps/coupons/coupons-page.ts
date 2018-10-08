import {EventData, Observable, topmost} from "ui/frame";
import { NavigatedData, Page } from "ui/page";
import { CouponsViewModel } from "./coupons-view-model";

let lib = require("~/lib");
let Badge = lib.pop.Badge;
let Scan = lib.Scan;
let Convert = lib.Convert;
import Log from "~/lib/Log";

export function onNavigatingTo(args: NavigatedData) {
    Log.print("test-log")
    const page = <Page>args.object;
    page.bindingContext = new CouponsViewModel();
}

export function onBack(){
    topmost().goBack();
}

export function addCoupon(args: EventData){
    Log.print("adding coupon");
    Scan.scan()
        .then(resultJSON =>{
                Log.print("scanned:", resultJSON);
                const sigData = Convert.jsonToObject(resultJSON);
                const sig = PoP.signWithPopToken(party.getPopToken(),
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

                    if (error !== ScanToReturn.SCAN_ABORTED) {
                        return Dialog.alert({
                            title: "Error",
                            message: "An error occured, please retry. - " + error,
                            okButtonText: "Ok"
                        });
                    }

                });
        })
}