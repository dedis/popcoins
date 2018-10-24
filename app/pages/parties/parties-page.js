"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialog = require("tns-core-modules/ui/dialogs");
const Badge = require("~/lib/pop/Badge");
const Log_1 = require("~/lib/Log");
const Scan = require("~/lib/Scan");
const Convert = require("~/lib/Convert");
const observable_1 = require("tns-core-modules/data/observable");
const app_1 = require("~/app");
const Defaults = require("~/lib/Defaults");
let view = undefined;
function onNavigatingTo(args) {
    view = args.object;
    view.bindingContext = observable_1.fromObject({
        party: undefined,
        config: {},
        qrcode: undefined
    });
    return loadParties();
}
exports.onNavigatingTo = onNavigatingTo;
function updateView(party) {
    if (party) {
        view.bindingContext.config = party.config;
        view.bindingContext.qrcode = party.qrcodePublic();
        view.bindingContext.party = party;
    }
    else {
        view.bindingContext.party = undefined;
        view.bindingContext.config = {};
    }
}
function loadParties() {
    app_1.gData.parties.forEach(party => {
        updateView(party);
    });
}
function addParty() {
    return Scan.scan()
        .then(string => {
        const infos = Convert.jsonToObject(string);
        return Badge.MigrateFrom.conodeGetWallet(infos.address, infos.omniledgerId, infos.id);
    })
        .catch(error => {
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
            }
            else {
                throw new Error("Aborted party-id");
            }
        });
    })
        .then(newParty => {
        newParty.attendeesAdd([newParty.keypair.public]);
        return newParty.save()
            .then(() => {
            app_1.gData.addParty(newParty);
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
        Log_1.default.catch(err, "error:");
        return Dialog.alert({
            title: "Remote parties error",
            message: err,
            okButtonText: "Continue"
        }).then(() => {
            throw new Error(err);
        });
    });
}
exports.addParty = addParty;
function partyTap(args) {
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
                        app_1.gData.removeBadge(view.bindingContext.party);
                    }
                    updateView(undefined);
                })
                    .catch(err => {
                    Log_1.default.rcatch(err);
                });
        }
    });
}
exports.partyTap = partyTap;
function onReload() {
}
exports.onReload = onReload;
