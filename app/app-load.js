"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = require("tns-core-modules/data/observable");
const frame_1 = require("tns-core-modules/ui/frame");
const Log_1 = require("~/lib/Log");
const observable_array_1 = require("tns-core-modules/data/observable-array");
const Data_1 = require("~/lib/Data");
const app_1 = require("~/app");
let view = undefined;
let actions = new observable_array_1.ObservableArray();
function onLoaded(args) {
    view = args.object;
    view.bindingContext = observable_1.fromObject({ updateActions: actions });
    if (app_1.gData == undefined) {
        addAction("Loading data");
        return Data_1.Data.load()
            .then(d => {
            app_1.setGdata(d);
        })
            .then(() => {
            addAction("Loading Badges");
            return app_1.gData.loadBadges();
        })
            .then(() => {
            return updateData();
        })
            .then(() => {
            return frame_1.topmost().navigate({
                moduleName: "app-tabview"
            });
        })
            .catch(err => {
            Log_1.default.catch(err);
        });
    }
}
exports.onLoaded = onLoaded;
function addAction(str) {
    actions.push({ description: str });
}
function updateData() {
    addAction("Updating data");
    return Promise.resolve();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWxvYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlFQUE4RDtBQUM5RCxxREFBa0U7QUFDbEUsbUNBQTRCO0FBQzVCLDZFQUF5RTtBQUN6RSxxQ0FBa0M7QUFDbEMsK0JBQXdDO0FBRXhDLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztBQUNyQixJQUFJLE9BQU8sR0FBRyxJQUFJLGtDQUFlLEVBQUUsQ0FBQztBQUVwQyxrQkFBeUIsSUFBbUI7SUFDeEMsSUFBSSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyx1QkFBVSxDQUFDLEVBQUMsYUFBYSxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7SUFDM0QsRUFBRSxDQUFDLENBQUMsV0FBSyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDckIsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFO2FBQ2IsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ04sY0FBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUCxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsV0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzdCLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUCxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEIsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNQLE1BQU0sQ0FBQyxlQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBQ3RCLFVBQVUsRUFBRSxhQUFhO2FBQzVCLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQzthQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNULGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0FBQ0wsQ0FBQztBQXpCRCw0QkF5QkM7QUFFRCxtQkFBbUIsR0FBVztJQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsV0FBVyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUVEO0lBQ0ksU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5hdmlnYXRlZERhdGEsIFBhZ2UsIFZpZXcgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlXCI7XG5pbXBvcnQgeyBmcm9tT2JqZWN0IH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlXCI7XG5pbXBvcnQgeyBnZXRGcmFtZUJ5SWQsIHRvcG1vc3QgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9mcmFtZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwifi9saWIvTG9nXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUtYXJyYXlcIjtcbmltcG9ydCB7IERhdGEgfSBmcm9tIFwifi9saWIvRGF0YVwiO1xuaW1wb3J0IHsgZ0RhdGEsIHNldEdkYXRhIH0gZnJvbSBcIn4vYXBwXCI7XG5cbmxldCB2aWV3ID0gdW5kZWZpbmVkO1xubGV0IGFjdGlvbnMgPSBuZXcgT2JzZXJ2YWJsZUFycmF5KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbkxvYWRlZChhcmdzOiBOYXZpZ2F0ZWREYXRhKSB7XG4gICAgdmlldyA9IDxWaWV3PmFyZ3Mub2JqZWN0O1xuICAgIHZpZXcuYmluZGluZ0NvbnRleHQgPSBmcm9tT2JqZWN0KHt1cGRhdGVBY3Rpb25zOiBhY3Rpb25zfSk7XG4gICAgaWYgKGdEYXRhID09IHVuZGVmaW5lZCkge1xuICAgICAgICBhZGRBY3Rpb24oXCJMb2FkaW5nIGRhdGFcIik7XG4gICAgICAgIHJldHVybiBEYXRhLmxvYWQoKVxuICAgICAgICAgICAgLnRoZW4oZCA9PiB7XG4gICAgICAgICAgICAgICAgc2V0R2RhdGEoZCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT57XG4gICAgICAgICAgICAgICAgYWRkQWN0aW9uKFwiTG9hZGluZyBCYWRnZXNcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdEYXRhLmxvYWRCYWRnZXMoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9wbW9zdCgpLm5hdmlnYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZTogXCJhcHAtdGFidmlld1wiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgTG9nLmNhdGNoKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZEFjdGlvbihzdHI6IHN0cmluZykge1xuICAgIGFjdGlvbnMucHVzaCh7ZGVzY3JpcHRpb246IHN0cn0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVEYXRhKCk6IFByb21pc2U8YW55PiB7XG4gICAgYWRkQWN0aW9uKFwiVXBkYXRpbmcgZGF0YVwiKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59XG4iXX0=