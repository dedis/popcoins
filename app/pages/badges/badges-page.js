"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialog = require("tns-core-modules/ui/dialogs");
const frame_1 = require("tns-core-modules/ui/frame");
const badges_view_model_1 = require("./badges-view-model");
const Log_1 = require("~/lib/Log");
const Badge = require("~/lib/pop/Badge");
const app_1 = require("~/app");
let page;
const pageObject = undefined;
function onNavigatingTo(args) {
    page = args.object;
    page.bindingContext = badges_view_model_1.BadgesViewModel;
    showBadges(Promise.resolve(app_1.gData.badges));
    setTimeout(() => {
        showBadges(app_1.gData.updateAllBadges());
    }, 100);
}
exports.onNavigatingTo = onNavigatingTo;
function showBadges(badges) {
    Log_1.Log.lvl1("Loading parties");
    badges.then(badges => {
        page.bindingContext.items.splice(0);
        page.bindingContext.isEmpty = true;
        badges.forEach((badge, index) => {
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
function partyTapped(args) {
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
                        return app_1.gData.removeBadge(party)
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
                return frame_1.topmost().navigate({
                    moduleName: "pages/admin/parties/config/config-page",
                    context: {
                        wallet: party,
                        readOnly: true
                    }
                });
        }
    });
}
exports.partyTapped = partyTapped;
