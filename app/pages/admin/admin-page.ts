import {topmost} from "ui/frame";
import {NavigatedData, Page} from "ui/page";
import {AdminViewModel} from "./admin-view-model";
import Log from "../../lib/Log";
import {SelectedIndexChangedEventData} from "tns-core-modules/ui/tab-view";
import {SegmentedBar} from "tns-core-modules/ui/segmented-bar";
import {onNavigatingTo as partiesTo, onNavigatedFrom as partiesFrom} from "~/pages/admin/parties/admin-parties-page";
import {onNavigatingTo as conodesTo, onNavigatedFrom as conodesFrom} from "~/pages/admin/conodes/conodes-page";

let page: Page = undefined;
let segBar: SegmentedBar = undefined;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    page.bindingContext = new AdminViewModel();
    page.bindingContext.set("prop", segBar.selectedIndex);
    partiesTo();
    conodesTo();
}

export function onNavigatedFrom(args: NavigatedData) {
    partiesFrom();
    conodesFrom();
}

export function onBack() {
    topmost().goBack();
}

export function sbLoaded(args:NavigatedData) {
    // handle selected index change
    segBar = <SegmentedBar>args.object;
    segBar.on("selectedIndexChange", selectedIndexChange);
}

export function selectedIndexChange(sbargs: SelectedIndexChangedEventData) {
    const page = (<SegmentedBar>sbargs.object).page;
    const vm = page.bindingContext;
    const selectedIndex = (<SegmentedBar>sbargs.object).selectedIndex;
    vm.set("prop", selectedIndex);
}