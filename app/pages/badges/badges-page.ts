import {View} from "ui/core/view";
import {ItemEventData} from "ui/list-view";
import {Item} from "./shared/item";
import { NavigatedData, Page } from "ui/page";
import { BadgesViewModel } from "./badges-view-model";

import {Badge} from "../../lib/pop/Badge";
import Log from "../../lib/Log";

let page: Page;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    page.bindingContext = new BadgesViewModel();
    return loadParties();
}

function loadParties() {
    Log.print("test");
    return Badge.loadAll()
        .then(wallets => {
            return Badge.fetchUpcoming(wallets)
        })
        .then(upcoming =>{
            Object.values(upcoming).forEach(config => {
                Log.print(config);
                // viewModel.partyListDescriptions.push(getViewModel(wallet));
            });
            //
            // viewModel.isEmpty = viewModel.partyListDescriptions.length === 0;
            // viewModel.isLoading = false;
            //
            // return reloadStatuses();
        })
        .catch(err => {
            Log.catch(err);
        });
}
