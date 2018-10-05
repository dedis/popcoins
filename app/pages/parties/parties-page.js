"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parties_view_model_1 = require("./parties-view-model");
const pop_1 = require("../../lib/pop");
const Log_1 = require("../../lib/Log");
let page;
function onNavigatingTo(args) {
    page = args.object;
    page.bindingContext = new parties_view_model_1.PartiesViewModel();
    return loadParties();
}
exports.onNavigatingTo = onNavigatingTo;
function onItemTap(args) {
    const view = args.view;
    const page = view.page;
    const tappedItem = view.bindingContext;
    page.frame.navigate({
        moduleName: "home/home-item-detail/home-item-detail-page",
        context: tappedItem,
        animated: true,
        transition: {
            name: "slide",
            duration: 200,
            curve: "ease"
        }
    });
}
exports.onItemTap = onItemTap;
function loadParties() {
    return pop_1.pop.Wallet.loadAll()
        .then(wallets => {
        Object.values(wallets).forEach(wallet => {
            Log_1.log.print(wallet);
            // viewModel.partyListDescriptions.push(getViewModel(wallet));
        });
        //
        // viewModel.isEmpty = viewModel.partyListDescriptions.length === 0;
        // viewModel.isLoading = false;
        //
        // return reloadStatuses();
    })
        .catch(err => {
        Log_1.log.catch(err);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGllcy1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGFydGllcy1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0EsNkRBQXNEO0FBR3RELHVDQUFrQztBQUNsQyx1Q0FBa0M7QUFFbEMsSUFBSSxJQUFJLENBQUM7QUFFVCx3QkFBK0IsSUFBbUI7SUFDOUMsSUFBSSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLHFDQUFnQixFQUFFLENBQUM7SUFDN0MsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFKRCx3Q0FJQztBQUVELG1CQUEwQixJQUFtQjtJQUN6QyxNQUFNLElBQUksR0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzdCLE1BQU0sSUFBSSxHQUFTLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDN0IsTUFBTSxVQUFVLEdBQVMsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUU3QyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUNoQixVQUFVLEVBQUUsNkNBQTZDO1FBQ3pELE9BQU8sRUFBRSxVQUFVO1FBQ25CLFFBQVEsRUFBRSxJQUFJO1FBQ2QsVUFBVSxFQUFFO1lBQ1IsSUFBSSxFQUFFLE9BQU87WUFDYixRQUFRLEVBQUUsR0FBRztZQUNiLEtBQUssRUFBRSxNQUFNO1NBQ2hCO0tBQ0osQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWZELDhCQWVDO0FBRUQ7SUFDSSxNQUFNLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7U0FDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1osTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDcEMsU0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQiw4REFBOEQ7UUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFO1FBQ0Ysb0VBQW9FO1FBQ3BFLCtCQUErQjtRQUMvQixFQUFFO1FBQ0YsMkJBQTJCO0lBQy9CLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNULFNBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtWaWV3fSBmcm9tIFwidWkvY29yZS92aWV3XCI7XG5pbXBvcnQge0l0ZW1FdmVudERhdGF9IGZyb20gXCJ1aS9saXN0LXZpZXdcIjtcbmltcG9ydCB7TmF2aWdhdGVkRGF0YSwgUGFnZX0gZnJvbSBcInVpL3BhZ2VcIjtcbmltcG9ydCAqIGFzIGRpYWxvZ3MgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvZGlhbG9nc1wiO1xuXG5pbXBvcnQge1BhcnRpZXNWaWV3TW9kZWx9IGZyb20gXCIuL3BhcnRpZXMtdmlldy1tb2RlbFwiO1xuaW1wb3J0IHtJdGVtfSBmcm9tIFwiLi9zaGFyZWQvaXRlbVwiO1xuXG5pbXBvcnQge3BvcH0gZnJvbSBcIi4uLy4uL2xpYi9wb3BcIjtcbmltcG9ydCB7bG9nfSBmcm9tIFwiLi4vLi4vbGliL0xvZ1wiO1xuXG5sZXQgcGFnZTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9uTmF2aWdhdGluZ1RvKGFyZ3M6IE5hdmlnYXRlZERhdGEpIHtcbiAgICBwYWdlID0gPFBhZ2U+YXJncy5vYmplY3Q7XG4gICAgcGFnZS5iaW5kaW5nQ29udGV4dCA9IG5ldyBQYXJ0aWVzVmlld01vZGVsKCk7XG4gICAgcmV0dXJuIGxvYWRQYXJ0aWVzKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvbkl0ZW1UYXAoYXJnczogSXRlbUV2ZW50RGF0YSkge1xuICAgIGNvbnN0IHZpZXcgPSA8Vmlldz5hcmdzLnZpZXc7XG4gICAgY29uc3QgcGFnZSA9IDxQYWdlPnZpZXcucGFnZTtcbiAgICBjb25zdCB0YXBwZWRJdGVtID0gPEl0ZW0+dmlldy5iaW5kaW5nQ29udGV4dDtcblxuICAgIHBhZ2UuZnJhbWUubmF2aWdhdGUoe1xuICAgICAgICBtb2R1bGVOYW1lOiBcImhvbWUvaG9tZS1pdGVtLWRldGFpbC9ob21lLWl0ZW0tZGV0YWlsLXBhZ2VcIixcbiAgICAgICAgY29udGV4dDogdGFwcGVkSXRlbSxcbiAgICAgICAgYW5pbWF0ZWQ6IHRydWUsXG4gICAgICAgIHRyYW5zaXRpb246IHtcbiAgICAgICAgICAgIG5hbWU6IFwic2xpZGVcIixcbiAgICAgICAgICAgIGR1cmF0aW9uOiAyMDAsXG4gICAgICAgICAgICBjdXJ2ZTogXCJlYXNlXCJcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkUGFydGllcygpIHtcbiAgICByZXR1cm4gcG9wLldhbGxldC5sb2FkQWxsKClcbiAgICAgICAgLnRoZW4od2FsbGV0cyA9PiB7XG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKHdhbGxldHMpLmZvckVhY2god2FsbGV0ID0+IHtcbiAgICAgICAgICAgICAgICBsb2cucHJpbnQod2FsbGV0KTtcbiAgICAgICAgICAgICAgICAvLyB2aWV3TW9kZWwucGFydHlMaXN0RGVzY3JpcHRpb25zLnB1c2goZ2V0Vmlld01vZGVsKHdhbGxldCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gdmlld01vZGVsLmlzRW1wdHkgPSB2aWV3TW9kZWwucGFydHlMaXN0RGVzY3JpcHRpb25zLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIC8vIHZpZXdNb2RlbC5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyByZXR1cm4gcmVsb2FkU3RhdHVzZXMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBsb2cuY2F0Y2goZXJyKTtcbiAgICAgICAgfSk7XG59Il19