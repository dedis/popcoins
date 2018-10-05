import { NavigatedData, Page } from "ui/page";
import { BadgesViewModel } from "./badges-view-model";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new BadgesViewModel();
}
