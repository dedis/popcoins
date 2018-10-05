import {View} from "ui/core/view";
import {ItemEventData} from "ui/list-view";
import {NavigatedData, Page} from "ui/page";
import * as dialogs from "tns-core-modules/ui/dialogs";

import {PartiesViewModel} from "./parties-view-model";
import {Item} from "./shared/item";

import {pop} from "../../lib/pop";
import {log} from "../../lib/Log";

let page;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    page.bindingContext = new PartiesViewModel();
    return loadParties();
}

export function onItemTap(args: ItemEventData) {
    const view = <View>args.view;
    const page = <Page>view.page;
    const tappedItem = <Item>view.bindingContext;

    page.frame.navigate({
        moduleName: "home/home-item-detail/home-item-detail-page",
        context: tappedItem,
        animated: true,
        transition: {
            name: "slide",
            duration: 200,
            curve: "ease"
        }
    });
}

function loadParties() {
    return pop.Wallet.loadAll()
        .then(wallets => {
            Object.values(wallets).forEach(wallet => {
                log.print(wallet);
                // viewModel.partyListDescriptions.push(getViewModel(wallet));
            });
            //
            // viewModel.isEmpty = viewModel.partyListDescriptions.length === 0;
            // viewModel.isLoading = false;
            //
            // return reloadStatuses();
        })
        .catch(err => {
            log.catch(err);
        });
}