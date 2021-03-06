import {EventData, NavigatedData, Page, View} from "ui/page";
import * as Dialog from "tns-core-modules/ui/dialogs";

import * as Badge from "~/lib/pop/Badge";
import Log from "~/lib/Log";
import * as Scan from "~/lib/Scan";
import * as Convert from "~/lib/Convert";
import {fromObject} from "tns-core-modules/data/observable";
import {gData} from "~/app";
import * as Defaults from "~/lib/Defaults";

let view: View = undefined;

export function onNavigatingTo(args: NavigatedData) {
    view = <View>args.object;
    view.bindingContext = fromObject({
        party: undefined,
        config: {},
        qrcode: undefined
    });
    return loadParties();
}

function updateView(party: Badge.Badge) {
    if (party) {
        view.bindingContext.config = party.config;
        view.bindingContext.qrcode = party.qrcodePublic();
        view.bindingContext.party = party;
    } else {
        view.bindingContext.party = undefined;
        view.bindingContext.config = {};
    }
}

function loadParties() {
    gData.parties.forEach(party => {
        updateView(party);
    })
}

export function addParty() {
    return Scan.scan()
        .then(string => {
            const infos = Convert.jsonToObject(string);
            return Badge.MigrateFrom.conodeGetWallet(infos.address,
                infos.omniledgerId, infos.id);
        })
        .catch(error => {
            if (Defaults.DEBUG_MODE) {
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
                    if (r.result) {
                        return Badge.MigrateFrom.conodeGetWallet("tls://gasser.blue:7002", Defaults.OMNILEDGER_INSTANCE_ID, r.text);
                    } else {
                        throw new Error("Aborted party-id");
                    }
                })
            } else {
                Log.rcatch(error, "couldn't scan party");
            }

        })
        .then(newParty => {
            newParty.attendeesAdd([newParty.keypair.public]);
            return newParty.save()
                .then(() => {
                    gData.addParty(newParty);
                    updateView(newParty);
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

export function partyTap(args: EventData) {
    if (!view.bindingContext.party) {
        return;
    }

    const actionShare = "Share party-definition";
    const actionDelete = "Delete party";

    return Dialog.action({
        message: "What do you want to do?",
        cancelButtonText: "Cancel",
        actions: [actionShare, actionDelete]
    }).then(result => {
        switch (result) {
            case actionShare:
                view.showModal("pages/common/qr-code/qr-code-page", {
                    textToShow: Convert.objectToJson({
                        id: view.bindingContext.party.config.hashStr(),
                        omniledgerId: Defaults.OMNILEDGER_INSTANCE_ID,
                        address: view.bindingContext.party.linkedConode.tcpAddr
                    }),
                    title: "Party information",
                }, () => {
                }, true);
                break;
            case actionDelete:
                return Dialog.confirm("Do you really want to delete that party?")
                    .then(del => {
                        if (del) {
                            gData.removeBadge(view.bindingContext.party);
                        }
                        updateView(undefined);
                    })
                    .catch(err => {
                        Log.rcatch(err);
                    });
        }
    })
}

export function onReload() {
}