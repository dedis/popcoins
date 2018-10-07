"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const badges_view_model_1 = require("./badges-view-model");
const Dialog = require("tns-core-modules/ui/dialogs");
const frame_1 = require("tns-core-modules/ui/frame");
let lib = require("../../lib");
let Badge = lib.pop.Badge;
let Log = lib.Log.default;
let page = undefined;
let pageObject = undefined;
function onNavigatingTo(args) {
    Log.print("getting to badges");
    page = args.object;
    page.bindingContext = badges_view_model_1.BadgesViewModel;
    Log.print("isempty:", page.bindingContext.isEmpty);
    return loadParties();
}
exports.onNavigatingTo = onNavigatingTo;
function loadParties() {
    Log.lvl1("Loading parties");
    page.bindingContext.items.splice(0);
    return Badge.Badge.loadAll()
        .then(badges => {
        return Badge.Badge.updateAll();
    })
        .then(badges => {
        page.bindingContext.isEmpty = true;
        Object.values(badges).forEach((badge, index) => {
            Log.print("Found badge with state:", badge.state());
            if (badge.state() == Badge.STATE_TOKEN) {
                page.bindingContext.items.push({
                    party: badge,
                    name: badge.config.name,
                    datetime: badge.config.datetime,
                    location: badge.config.location,
                    index: index + 1
                });
                Log.print("setting isEmpty to false");
                page.bindingContext.isEmpty = false;
            }
        });
        Log.print("isempty:", page.bindingContext.isEmpty);
    })
        .catch(err => {
        Log.catch(err);
    });
}
function partyTapped(args) {
    const index = args.index;
    const party = page.bindingContext.items.getItem(index).party;
    const WALLET_DELETE = "Delete";
    const WALLET_SHOW = "Show";
    let actions = [WALLET_SHOW, WALLET_DELETE];
    return Dialog.action({
        message: "Choose an Action",
        cancelButtonText: "Cancel",
        actions: actions
    }).then(result => {
        switch (result) {
            case WALLET_DELETE:
                Dialog.confirm({
                    title: "Deleting party-token",
                    message: "You're about to delete the party-token - \n" +
                        "are you sure?",
                    okButtonText: "Yes, delete",
                    cancelButtonText: "No, keep"
                })
                    .then(del => {
                    if (del) {
                        return party.remove()
                            .then(() => {
                            page.bindingContext.items.splice(index, 1);
                            return pageObject.getViewById("listView").refresh();
                        });
                    }
                })
                    .catch(err => {
                    console.log("error while deleting:", err);
                });
            case WALLET_SHOW:
                return frame_1.topmost().navigate({
                    moduleName: "pages/admin/parties/config/config-page",
                    context: {
                        wallet: party,
                        readOnly: true
                    }
                });
        }
    });
}
exports.partyTapped = partyTapped;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2VzLXBhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYWRnZXMtcGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDJEQUFvRDtBQUNwRCxzREFBc0Q7QUFDdEQscURBQWtEO0FBRWxELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMvQixJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUMxQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUUxQixJQUFJLElBQUksR0FBUyxTQUFTLENBQUM7QUFDM0IsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBRTNCLHdCQUErQixJQUFtQjtJQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDL0IsSUFBSSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxtQ0FBZSxDQUFDO0lBQ3RDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkQsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFORCx3Q0FNQztBQUVEO0lBQ0ksR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7U0FDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQSxFQUFFO1FBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkMsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ1gs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LEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsS0FBSyxXQUFXO2dCQUNaLE1BQU0sQ0FBQyxlQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7b0JBQ3RCLFVBQVUsRUFBRSx3Q0FBd0M7b0JBQ3BELE9BQU8sRUFBRTt3QkFDTCxNQUFNLEVBQUUsS0FBSzt3QkFDYixRQUFRLEVBQUUsSUFBSTtxQkFDakI7aUJBQ0osQ0FBQyxDQUFDO1FBQ1gsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQTVDRCxrQ0E0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05hdmlnYXRlZERhdGEsIFBhZ2V9IGZyb20gXCJ1aS9wYWdlXCI7XG5pbXBvcnQge0JhZGdlc1ZpZXdNb2RlbH0gZnJvbSBcIi4vYmFkZ2VzLXZpZXctbW9kZWxcIjtcbmltcG9ydCAqIGFzIERpYWxvZyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzXCI7XG5pbXBvcnQge3RvcG1vc3R9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2ZyYW1lXCI7XG5cbmxldCBsaWIgPSByZXF1aXJlKFwiLi4vLi4vbGliXCIpO1xubGV0IEJhZGdlID0gbGliLnBvcC5CYWRnZTtcbmxldCBMb2cgPSBsaWIuTG9nLmRlZmF1bHQ7XG5cbmxldCBwYWdlOiBQYWdlID0gdW5kZWZpbmVkO1xubGV0IHBhZ2VPYmplY3QgPSB1bmRlZmluZWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbk5hdmlnYXRpbmdUbyhhcmdzOiBOYXZpZ2F0ZWREYXRhKSB7XG4gICAgTG9nLnByaW50KFwiZ2V0dGluZyB0byBiYWRnZXNcIik7XG4gICAgcGFnZSA9IDxQYWdlPmFyZ3Mub2JqZWN0O1xuICAgIHBhZ2UuYmluZGluZ0NvbnRleHQgPSBCYWRnZXNWaWV3TW9kZWw7XG4gICAgTG9nLnByaW50KFwiaXNlbXB0eTpcIiwgcGFnZS5iaW5kaW5nQ29udGV4dC5pc0VtcHR5KTtcbiAgICByZXR1cm4gbG9hZFBhcnRpZXMoKTtcbn1cblxuZnVuY3Rpb24gbG9hZFBhcnRpZXMoKSB7XG4gICAgTG9nLmx2bDEoXCJMb2FkaW5nIHBhcnRpZXNcIik7XG4gICAgcGFnZS5iaW5kaW5nQ29udGV4dC5pdGVtcy5zcGxpY2UoMCk7XG4gICAgcmV0dXJuIEJhZGdlLkJhZGdlLmxvYWRBbGwoKVxuICAgICAgICAudGhlbihiYWRnZXM9PntcbiAgICAgICAgICAgIHJldHVybiBCYWRnZS5CYWRnZS51cGRhdGVBbGwoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oYmFkZ2VzID0+IHtcbiAgICAgICAgICAgIHBhZ2UuYmluZGluZ0NvbnRleHQuaXNFbXB0eSA9IHRydWU7XG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKGJhZGdlcykuZm9yRWFjaCgoYmFkZ2U6YW55LCBpbmRleDpudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICBMb2cucHJpbnQoXCJGb3VuZCBiYWRnZSB3aXRoIHN0YXRlOlwiLCBiYWRnZS5zdGF0ZSgpKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFkZ2Uuc3RhdGUoKSA9PSBCYWRnZS5TVEFURV9UT0tFTikge1xuICAgICAgICAgICAgICAgICAgICBwYWdlLmJpbmRpbmdDb250ZXh0Lml0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydHk6IGJhZGdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYmFkZ2UuY29uZmlnLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRldGltZTogYmFkZ2UuY29uZmlnLmRhdGV0aW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IGJhZGdlLmNvbmZpZy5sb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCArIDFcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgTG9nLnByaW50KFwic2V0dGluZyBpc0VtcHR5IHRvIGZhbHNlXCIpXG4gICAgICAgICAgICAgICAgICAgIHBhZ2UuYmluZGluZ0NvbnRleHQuaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTG9nLnByaW50KFwiaXNlbXB0eTpcIiwgcGFnZS5iaW5kaW5nQ29udGV4dC5pc0VtcHR5KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBMb2cuY2F0Y2goZXJyKTtcbiAgICAgICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0eVRhcHBlZChhcmdzKSB7XG4gICAgY29uc3QgaW5kZXggPSBhcmdzLmluZGV4O1xuICAgIGNvbnN0IHBhcnR5ID0gcGFnZS5iaW5kaW5nQ29udGV4dC5pdGVtcy5nZXRJdGVtKGluZGV4KS5wYXJ0eTtcblxuICAgIGNvbnN0IFdBTExFVF9ERUxFVEUgPSBcIkRlbGV0ZVwiO1xuICAgIGNvbnN0IFdBTExFVF9TSE9XID0gXCJTaG93XCI7XG5cbiAgICBsZXQgYWN0aW9ucyA9IFtXQUxMRVRfU0hPVywgV0FMTEVUX0RFTEVURV07XG4gICAgcmV0dXJuIERpYWxvZy5hY3Rpb24oe1xuICAgICAgICBtZXNzYWdlOiBcIkNob29zZSBhbiBBY3Rpb25cIixcbiAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogXCJDYW5jZWxcIixcbiAgICAgICAgYWN0aW9uczogYWN0aW9uc1xuICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgc3dpdGNoIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGNhc2UgV0FMTEVUX0RFTEVURTpcbiAgICAgICAgICAgICAgICBEaWFsb2cuY29uZmlybSh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIkRlbGV0aW5nIHBhcnR5LXRva2VuXCIsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiWW91J3JlIGFib3V0IHRvIGRlbGV0ZSB0aGUgcGFydHktdG9rZW4gLSBcXG5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImFyZSB5b3Ugc3VyZT9cIixcbiAgICAgICAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiBcIlllcywgZGVsZXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IFwiTm8sIGtlZXBcIlxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGRlbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnR5LnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2UuYmluZGluZ0NvbnRleHQuaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlT2JqZWN0LmdldFZpZXdCeUlkKFwibGlzdFZpZXdcIikucmVmcmVzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3Igd2hpbGUgZGVsZXRpbmc6XCIsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBjYXNlIFdBTExFVF9TSE9XOlxuICAgICAgICAgICAgICAgIHJldHVybiB0b3Btb3N0KCkubmF2aWdhdGUoe1xuICAgICAgICAgICAgICAgICAgICBtb2R1bGVOYW1lOiBcInBhZ2VzL2FkbWluL3BhcnRpZXMvY29uZmlnL2NvbmZpZy1wYWdlXCIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhbGxldDogcGFydHksXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkT25seTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiJdfQ==