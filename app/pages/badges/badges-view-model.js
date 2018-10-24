"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = require("data/observable");
const observable_array_1 = require("tns-core-modules/data/observable-array");
exports.BadgesViewModel = observable_1.fromObjectRecursive({
    items: new observable_array_1.ObservableArray(0),
    isEmpty: true,
    party: undefined
});
