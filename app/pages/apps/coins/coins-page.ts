import { topmost } from "ui/frame";
import { NavigatedData, Page } from "ui/page";
import { CoinsViewModel } from "./coins-view-model";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new CoinsViewModel();
}

export function onBack(){
    topmost().goBack();
}