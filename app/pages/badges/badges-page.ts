import {NavigatedData, Page} from "ui/page";
import {BadgesViewModel} from "./badges-view-model";
import * as Dialog from "tns-core-modules/ui/dialogs";
import {topmost} from "tns-core-modules/ui/frame";

let lib = require("~/lib");
let Badge = lib.pop.Badge;
let Log = lib.Log.default;

let page: Page = undefined;
let pageObject = undefined;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    page.bindingContext = BadgesViewModel;
    return loadParties();
}

function loadParties() {
    Log.lvl1("Loading parties");
    page.bindingContext.items.splice(0);
    return Badge.Badge.loadAll()
        .then(badges=>{
            return Badge.Badge.updateAll();
        })
        .then(badges => {
            page.bindingContext.isEmpty = true;
            Object.values(badges).forEach((badge:any, index:number) => {
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
    const party = page.bindingContext.items.getItem(index).party;

    const WALLET_DELETE = "Delete";
    const WALLET_SHOW = "Show";

    let actions = [WALLET_SHOW, WALLET_DELETE];
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
                    moduleName: "pages/admin/parties/config/config-page",
                    context: {
                        wallet: party,
                        readOnly: true
                    }
                });
        }
    });
}
