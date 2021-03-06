const Dialog = require("ui/dialogs");
const ObservableArray = require("data/observable-array").ObservableArray;
const topmost = require("ui/frame").topmost;
const platformModule = require("tns-core-modules/platform");

const lib = require("../../../../lib");
const Convert = lib.Convert;
const Scan = lib.Scan;
const FileIO = lib.FileIO;
const FilePaths = lib.FilePaths;
const Coupon = lib.Coupon;
const Helper = lib.Helper;
const ObjectType = lib.ObjectType;
const User = lib.User;

let bar = undefined;

let viewModel = {
    dates: new ObservableArray()
};

function onLoaded(args) {
    const page = args.object;
    const context = page.navigationContext;

    page.bindingContext = viewModel;

    if (context.coupon === undefined) {
        throw new Error("A service should be given in the context");
    } else if (!(context.coupon instanceof Coupon)) {
        throw new Error("Service given in context should be an instance of Service")
    }

    bar = context.coupon;

    let countLabel = page.getViewById("count");
    // Without this the text is not vertically centered in is own view
    if (platformModule.isAndroid)
        countLabel.android.setGravity(android.view.Gravity.CENTER);

    loadDates();
}

function loadDates() {
    viewModel.dates.splice(0);

    const orderHistory = bar.getOrderHistoryModule();
    orderHistory.forEach(date => {
        viewModel.dates.push({
        date: date.toString()
    })
})
}

function goBack() {
    topmost().goBack();
}

function clear() {
    Dialog.confirm({
        title: "Be careful!",
        message: "Every order in this history will be deleted! Are you sure you want to continue?",
        okButtonText: "Yes",
        cancelButtonText: "No"
    }).then(result => {
        if (result) {
            viewModel.dates.splice(0);
            return bar.resetOrderHistory();
        } else {
            return Promise.resolve()
        }
    });
}

module.exports.goBack = goBack;
module.exports.onLoaded = onLoaded;
module.exports.clear = clear;
