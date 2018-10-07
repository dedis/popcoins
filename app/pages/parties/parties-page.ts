import {NavigatedData, Page} from "ui/page";
import * as Dialog from "tns-core-modules/ui/dialogs";

import * as view from "./parties-view-model";

import * as Badge from "~/lib/pop/Badge";
import Log from "~/lib/Log";
import * as Scan from "../../lib/Scan";
import * as Convert from "~/lib/Convert";
import * as RequestPath from "~/lib/network/RequestPath";
import {fromObject} from "tns-core-modules/data/observable";

let page;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    page.bindingContext = fromObject({
        party: undefined,
        qrcode: undefined
    });
    return loadParties();
}

function loadParties() {
    return Badge.Badge.loadAll()
    // .then(wallets => {
    //     return Badge.fetchUpcoming(wallets)
    // })
        .then(upcoming => {
            Object.values(upcoming).forEach(party => {
                Log.print("found party with state", party.state());
                if (party.state() == Badge.STATE_PUBLISH) {
                    Log.print("found published party", party.config.name);
                    page.bindingContext.party = party;
                    page.bindingContext.qrcode = party.qrcodePublic();
                }
            });
        })
        .catch(err => {
            Log.catch(err);
        });
}

export function addParty() {
    return Scan.scan()
        .then(string => {
            const infos = Convert.jsonToObject(string);
            return Badge.MigrateFrom.conodeGetWallet(infos.address,
                infos.omniledgerId, infos.id);
        })
        .catch(error => {
            Log.print(error, "error while scanning");
            return Dialog.prompt({
                // This is for the iOS simulator that doesn't have a
                // camera - in the simulator it's easy to copy/paste the
                // party-id, whereas on a real phone you wouldn't want
                // to do that.
                title: "Party-ID",
                message: "Couldn't scan party-id. Please enter party-id manually.",
                okButtonText: "Join Party",
                cancelButtonText: "Quit",
                defaultText: "",
                inputType: Dialog.inputType.text
            }).then(r => {
                if (r) {
                    return Badge.MigrateFrom.conodeGetWallet("tls://gasser.blue:7002", RequestPath.OMNILEDGER_INSTANCE_ID, r.text);
                } else {
                    throw new Error("Aborted party-id");
                }
            })

        })
        .then(newParty => {
            newParty.attendeesAdd([newParty.keypair.public]);
            return newParty.save()
                .then(() => {
                    page.bindingContext.party = newParty;
                    page.bindingContext.qrcode = newParty.qrcodePublic();
                })
                .catch(error => {
                    Dialog.alert({
                        title: "Saving error",
                        message: "Couldn't save the party: " + error,
                        okButtonText: "OK"
                    });
                });
        })
        .catch(err => {
            Log.catch(err, "error:");
            return Dialog.alert({
                title: "Remote parties error",
                message: err,
                okButtonText: "Continue"
            }).then(() => {
                throw new Error(err);
            })
        })
}

export function onReload() {
    Log.print("reloading with party", page.bindingContext.party );
}