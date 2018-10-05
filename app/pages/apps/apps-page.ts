import { topmost } from "ui/frame";
import { NavigatedData, Page } from "ui/page";
import { AppsViewModel } from "./apps-view-model";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new AppsViewModel();
}
