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
