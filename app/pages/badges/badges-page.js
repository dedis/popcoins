"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const badges_view_model_1 = require("./badges-view-model");
const Badge_1 = require("../../lib/pop/Badge");
const Log_1 = require("../../lib/Log");
let page;
function onNavigatingTo(args) {
    page = args.object;
    page.bindingContext = new badges_view_model_1.BadgesViewModel();
    return loadParties();
}
exports.onNavigatingTo = onNavigatingTo;
function loadParties() {
    Log_1.default.print("test");
    return Badge_1.Badge.loadAll()
        .then(wallets => {
        return Badge_1.Badge.fetchUpcoming(wallets);
    })
        .then(upcoming => {
        Object.values(upcoming).forEach(config => {
            Log_1.default.print(config);
            // viewModel.partyListDescriptions.push(getViewModel(wallet));
        });
        //
        // viewModel.isEmpty = viewModel.partyListDescriptions.length === 0;
        // viewModel.isLoading = false;
        //
        // return reloadStatuses();
    })
        .catch(err => {
        Log_1.default.catch(err);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2VzLXBhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYWRnZXMtcGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLDJEQUFzRDtBQUV0RCwrQ0FBMEM7QUFDMUMsdUNBQWdDO0FBRWhDLElBQUksSUFBVSxDQUFDO0FBRWYsd0JBQStCLElBQW1CO0lBQzlDLElBQUksR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxtQ0FBZSxFQUFFLENBQUM7SUFDNUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFKRCx3Q0FJQztBQUVEO0lBQ0ksYUFBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixNQUFNLENBQUMsYUFBSyxDQUFDLE9BQU8sRUFBRTtTQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDWixNQUFNLENBQUMsYUFBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUN2QyxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDYixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNyQyxhQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLDhEQUE4RDtRQUNsRSxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUU7UUFDRixvRUFBb0U7UUFDcEUsK0JBQStCO1FBQy9CLEVBQUU7UUFDRiwyQkFBMkI7SUFDL0IsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ1QsYUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1ZpZXd9IGZyb20gXCJ1aS9jb3JlL3ZpZXdcIjtcbmltcG9ydCB7SXRlbUV2ZW50RGF0YX0gZnJvbSBcInVpL2xpc3Qtdmlld1wiO1xuaW1wb3J0IHtJdGVtfSBmcm9tIFwiLi9zaGFyZWQvaXRlbVwiO1xuaW1wb3J0IHsgTmF2aWdhdGVkRGF0YSwgUGFnZSB9IGZyb20gXCJ1aS9wYWdlXCI7XG5pbXBvcnQgeyBCYWRnZXNWaWV3TW9kZWwgfSBmcm9tIFwiLi9iYWRnZXMtdmlldy1tb2RlbFwiO1xuXG5pbXBvcnQge0JhZGdlfSBmcm9tIFwiLi4vLi4vbGliL3BvcC9CYWRnZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwiLi4vLi4vbGliL0xvZ1wiO1xuXG5sZXQgcGFnZTogUGFnZTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9uTmF2aWdhdGluZ1RvKGFyZ3M6IE5hdmlnYXRlZERhdGEpIHtcbiAgICBwYWdlID0gPFBhZ2U+YXJncy5vYmplY3Q7XG4gICAgcGFnZS5iaW5kaW5nQ29udGV4dCA9IG5ldyBCYWRnZXNWaWV3TW9kZWwoKTtcbiAgICByZXR1cm4gbG9hZFBhcnRpZXMoKTtcbn1cblxuZnVuY3Rpb24gbG9hZFBhcnRpZXMoKSB7XG4gICAgTG9nLnByaW50KFwidGVzdFwiKTtcbiAgICByZXR1cm4gQmFkZ2UubG9hZEFsbCgpXG4gICAgICAgIC50aGVuKHdhbGxldHMgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIEJhZGdlLmZldGNoVXBjb21pbmcod2FsbGV0cylcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4odXBjb21pbmcgPT57XG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKHVwY29taW5nKS5mb3JFYWNoKGNvbmZpZyA9PiB7XG4gICAgICAgICAgICAgICAgTG9nLnByaW50KGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgLy8gdmlld01vZGVsLnBhcnR5TGlzdERlc2NyaXB0aW9ucy5wdXNoKGdldFZpZXdNb2RlbCh3YWxsZXQpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIHZpZXdNb2RlbC5pc0VtcHR5ID0gdmlld01vZGVsLnBhcnR5TGlzdERlc2NyaXB0aW9ucy5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICAvLyB2aWV3TW9kZWwuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gcmV0dXJuIHJlbG9hZFN0YXR1c2VzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgTG9nLmNhdGNoKGVycik7XG4gICAgICAgIH0pO1xufVxuIl19