import { topmost } from "ui/frame";
import { NavigatedData, Page } from "ui/page";
import { CouponsViewModel } from "./coupons-view-model";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new CouponsViewModel();
}

export function onBack(){
    topmost().goBack();
}