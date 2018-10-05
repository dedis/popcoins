"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parties_view_model_1 = require("./parties-view-model");
const Badge_1 = require("../../lib/pop/Badge");
const Log_1 = require("../../lib/Log");
let page;
function onNavigatingTo(args) {
    Log_1.default.print("party");
    page = args.object;
    page.bindingContext = new parties_view_model_1.PartiesViewModel();
    return loadParties();
    // .then(()=>{
    //     Log.print("Going to badges");
    //     return topmost().navigate({
    //         moduleName: "pages/badges/badges-page",
    //     })
    // });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGllcy1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGFydGllcy1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0EsNkRBQXNEO0FBR3RELCtDQUEwQztBQUMxQyx1Q0FBZ0M7QUFFaEMsSUFBSSxJQUFJLENBQUM7QUFFVCx3QkFBK0IsSUFBbUI7SUFDOUMsYUFBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQixJQUFJLEdBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN6QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUkscUNBQWdCLEVBQUUsQ0FBQztJQUM3QyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDakIsY0FBYztJQUNkLG9DQUFvQztJQUNwQyxrQ0FBa0M7SUFDbEMsa0RBQWtEO0lBQ2xELFNBQVM7SUFDVCxNQUFNO0FBQ2QsQ0FBQztBQVhELHdDQVdDO0FBRUQ7SUFDSSxhQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xCLE1BQU0sQ0FBQyxhQUFLLENBQUMsT0FBTyxFQUFFO1NBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNaLE1BQU0sQ0FBQyxhQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3ZDLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUNiLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3JDLGFBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsOERBQThEO1FBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRTtRQUNGLG9FQUFvRTtRQUNwRSwrQkFBK0I7UUFDL0IsRUFBRTtRQUNGLDJCQUEyQjtJQUMvQixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDVCxhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0FBQ1gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Vmlld30gZnJvbSBcInVpL2NvcmUvdmlld1wiO1xuaW1wb3J0IHtJdGVtRXZlbnREYXRhfSBmcm9tIFwidWkvbGlzdC12aWV3XCI7XG5pbXBvcnQge05hdmlnYXRlZERhdGEsIFBhZ2V9IGZyb20gXCJ1aS9wYWdlXCI7XG5pbXBvcnQge3RvcG1vc3R9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2ZyYW1lXCI7XG5cbmltcG9ydCB7UGFydGllc1ZpZXdNb2RlbH0gZnJvbSBcIi4vcGFydGllcy12aWV3LW1vZGVsXCI7XG5pbXBvcnQge0l0ZW19IGZyb20gXCIuL3NoYXJlZC9pdGVtXCI7XG5cbmltcG9ydCB7QmFkZ2V9IGZyb20gXCIuLi8uLi9saWIvcG9wL0JhZGdlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCIuLi8uLi9saWIvTG9nXCI7XG5cbmxldCBwYWdlO1xuXG5leHBvcnQgZnVuY3Rpb24gb25OYXZpZ2F0aW5nVG8oYXJnczogTmF2aWdhdGVkRGF0YSkge1xuICAgIExvZy5wcmludChcInBhcnR5XCIpO1xuICAgIHBhZ2UgPSA8UGFnZT5hcmdzLm9iamVjdDtcbiAgICBwYWdlLmJpbmRpbmdDb250ZXh0ID0gbmV3IFBhcnRpZXNWaWV3TW9kZWwoKTtcbiAgICByZXR1cm4gbG9hZFBhcnRpZXMoKTtcbiAgICAgICAgLy8gLnRoZW4oKCk9PntcbiAgICAgICAgLy8gICAgIExvZy5wcmludChcIkdvaW5nIHRvIGJhZGdlc1wiKTtcbiAgICAgICAgLy8gICAgIHJldHVybiB0b3Btb3N0KCkubmF2aWdhdGUoe1xuICAgICAgICAvLyAgICAgICAgIG1vZHVsZU5hbWU6IFwicGFnZXMvYmFkZ2VzL2JhZGdlcy1wYWdlXCIsXG4gICAgICAgIC8vICAgICB9KVxuICAgICAgICAvLyB9KTtcbn1cblxuZnVuY3Rpb24gbG9hZFBhcnRpZXMoKSB7XG4gICAgTG9nLnByaW50KFwidGVzdFwiKTtcbiAgICByZXR1cm4gQmFkZ2UubG9hZEFsbCgpXG4gICAgICAgIC50aGVuKHdhbGxldHMgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIEJhZGdlLmZldGNoVXBjb21pbmcod2FsbGV0cylcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4odXBjb21pbmcgPT57XG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKHVwY29taW5nKS5mb3JFYWNoKGNvbmZpZyA9PiB7XG4gICAgICAgICAgICAgICAgTG9nLnByaW50KGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgLy8gdmlld01vZGVsLnBhcnR5TGlzdERlc2NyaXB0aW9ucy5wdXNoKGdldFZpZXdNb2RlbCh3YWxsZXQpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIHZpZXdNb2RlbC5pc0VtcHR5ID0gdmlld01vZGVsLnBhcnR5TGlzdERlc2NyaXB0aW9ucy5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICAvLyB2aWV3TW9kZWwuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gcmV0dXJuIHJlbG9hZFN0YXR1c2VzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgTG9nLmNhdGNoKGVycik7XG4gICAgICAgIH0pO1xufSJdfQ==