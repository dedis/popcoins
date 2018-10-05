import { topmost } from "ui/frame";
import { NavigatedData, Page } from "ui/page";
import { AdminViewModel } from "./admin-view-model";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new AdminViewModel();
}
