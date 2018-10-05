import { topmost } from "ui/frame";
import { NavigatedData, Page } from "ui/page";
import { AdminViewModel } from "./admin-view-model";
import Log from "../../lib/Log";
import {SelectedIndexChangedEventData} from "tns-core-modules/ui/tab-view";

export function onNavigatingTo(args: NavigatedData) {
    // Log.print("Navigating here:", args)
    const page = <Page>args.object;
    page.bindingContext = new AdminViewModel();
}

export function onBack(){
    topmost().goBack();
}
