import {topmost} from "ui/frame";
import {NavigatedData, Page} from "ui/page";
import {AdminViewModel} from "./admin-view-model";
import Log from "../../lib/Log";
import {SelectedIndexChangedEventData} from "tns-core-modules/ui/tab-view";
import {SegmentedBar} from "tns-core-modules/ui/segmented-bar";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new AdminViewModel();
}

export function onBack() {
    topmost().goBack();
}

export function sbLoaded(args) {
    // handle selected index change
    const segmentedBarComponent: SegmentedBar = <SegmentedBar>args.object;
    segmentedBarComponent.on("selectedIndexChange", selectedIndexChange);
}

export function selectedIndexChange(sbargs: SelectedIndexChangedEventData) {
    const page = (<SegmentedBar>sbargs.object).page;
    const vm = page.bindingContext;
    const selectedIndex = (<SegmentedBar>sbargs.object).selectedIndex;
    vm.set("prop", selectedIndex);
}