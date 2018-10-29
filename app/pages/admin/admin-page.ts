import { topmost, ViewBase } from "ui/frame";
import { NavigatedData, Page } from "ui/page";
import { AdminViewModel } from "./admin-view-model";
import Log from "../../lib/Log";
import { SelectedIndexChangedEventData } from "tns-core-modules/ui/tab-view";
import { SegmentedBar } from "tns-core-modules/ui/segmented-bar";
import * as Parties       from "~/pages/admin/parties/admin-parties-page";
import * as Conodes       from "~/pages/admin/conodes/conodes-page";
import * as Coupons       from "~/pages/admin/coupons/admin-coupons-page";
import * as ByzCoin          from "~/pages/admin/byzcoin/byzcoin-page"

// These calls are used to simulate navigatingTo and navigatingFrom for the
// SegmentedBar, which do not support these events on the views.
let calls = {
    to: {
        coupons   : Coupons.onFocus,
        parties   : Parties.onFocus,
        conodes   : Conodes.onFocus,
        darc      : ByzCoin.onFocus 
    },
    from: {
        coupons   : Coupons.onBlur,
        parties   : Parties.onBlur,
        conodes   : Conodes.onBlur,
        darc      : ByzCoin.onBlur
    }
};

let page: Page = undefined;
let segBar: SegmentedBar = undefined;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    page.bindingContext = new AdminViewModel();
    page.bindingContext.set("prop", segBar.selectedIndex);
    // Workaround for slow building of UI first time. If onFocus is called
    // too fast, the UI is not set up yet, and there will be no `ViewBase`.
    setTimeout(()=>{
        callNavigating(segBar.selectedIndex, calls.to);
    }, 500);
}

export function onNavigatedFrom(args: NavigatedData) {
    callNavigating(segBar.selectedIndex, calls.from);
}

export function onBack() {
    topmost().goBack();
}

export function sbLoaded(args: NavigatedData) {
    // handle selected index change
    segBar = <SegmentedBar>args.object;
    segBar.on("selectedIndexChange", selectedIndexChange);
}

export function selectedIndexChange(sbargs: SelectedIndexChangedEventData) {
    const page = (<SegmentedBar>sbargs.object).page;
    const vm = page.bindingContext;
    const oldIndex = vm.get("prop");
    callNavigating(oldIndex, calls.from);
    const selectedIndex = (<SegmentedBar>sbargs.object).selectedIndex;
    callNavigating(selectedIndex, calls.to);
    vm.set("prop", selectedIndex);
}

function callNavigating(index: number, call: any) {
    switch (index) {
        case 0:
            page.getViewById("frameCoupons").eachChild(child => {
                call.coupons(child);
                return true;
            });
            break;
        case 1:
            page.getViewById("frameParties").eachChild(child => {
                call.parties(child);
                return true;
            });
            break;
        case 2:
            page.getViewById("frameConodes").eachChild(child => {
                call.conodes(child);
                return true;
            });
            break;
        case 3:
            page.getViewById("frameByzCoin").eachChild(child => {
                call.darc(child);
                return true;
            });
            break;
    }
}
