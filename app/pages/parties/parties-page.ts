import {View} from "ui/core/view";
import {ItemEventData} from "ui/list-view";
import {NavigatedData, Page} from "ui/page";
import {topmost} from "tns-core-modules/ui/frame";

import {PartiesViewModel} from "./parties-view-model";
import {Item} from "./shared/item";

import {Badge} from "../../lib/pop/Badge";
import Log from "../../lib/Log";

let page;

export function onNavigatingTo(args: NavigatedData) {
    Log.print("party");
    page = <Page>args.object;
    page.bindingContext = new PartiesViewModel();
    return loadParties();
        // .then(()=>{
        //     Log.print("Going to badges");
        //     return topmost().navigate({
        //         moduleName: "pages/badges/badges-page",
        //     })
        // });
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