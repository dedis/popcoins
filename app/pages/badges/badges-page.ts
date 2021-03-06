import * as Dialog from "tns-core-modules/ui/dialogs";
import {topmost} from "tns-core-modules/ui/frame";
import {NavigatedData, Page} from "ui/page";
import {BadgesViewModel} from "./badges-view-model";

import {Log} from "~/lib/Log";
import * as Badge from "~/lib/pop/Badge";
import {gData} from "~/app";

let page: Page;
const pageObject = undefined;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    page.bindingContext = BadgesViewModel;

    showBadges(Promise.resolve(gData.badges));

    setTimeout(() => {
        showBadges(gData.updateAllBadges());
    }, 100);
}

function showBadges(badges: Promise<Array<Badge.Badge>>) {
    Log.lvl1("Loading parties");

    badges.then(badges => {
        page.bindingContext.items.splice(0);
        page.bindingContext.isEmpty = true;
        badges.forEach((badge: any, index: number) => {
            if (badge.state() === Badge.STATE_TOKEN) {
                page.bindingContext.items.push({
                    party: badge,
                    name: badge.config.name,
                    datetime: badge.config.datetime,
                    location: badge.config.location,
                    index: index + 1
                });
                page.bindingContext.isEmpty = false;
            }
        });
    });
}

export function partyTapped(args) {
    const index = args.index;
    const party = page.bindingContext.items.getItem(index).party;

    const WALLET_DELETE = "Delete";
    const WALLET_SHOW = "Show";

    const actions = [WALLET_SHOW, WALLET_DELETE];

    return Dialog.action({
        message: "Choose an Action",
        cancelButtonText: "Cancel",
        actions
    }).then((result) => {
        switch (result) {
            case WALLET_DELETE:
                return Dialog.confirm({
                    title: "Deleting party-token",
                    message: "You're about to delete the party-token - \n" +
                        "are you sure?",
                    okButtonText: "Yes, delete",
                    cancelButtonText: "No, keep"
                })
                    .then((del) => {
                        if (del) {
                            return gData.removeBadge(party)
                                .then(() => {
                                    page.bindingContext.items.splice(index, 1);

                                    return pageObject.getViewById("listView").refresh();
                                });
                        }
                    })
                    .catch((err) => {
                        console.log("error while deleting:", err);
                    });
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
