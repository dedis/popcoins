"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function onNavigatingTo(args) {
    const page = args.object;
    const item = args.context;
    page.bindingContext = item;
}
exports.onNavigatingTo = onNavigatingTo;
function onBackButtonTap(args) {
    const view = args.object;
    const page = view.page;
    page.frame.goBack();
}
exports.onBackButtonTap = onBackButtonTap;
