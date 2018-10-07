const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const Observable = require("tns-core-modules/data/observable");
const topmost = require("ui/frame").topmost;

const lib = require("../../../../lib");
const Log = lib.Log.default;
const Badge = lib.pop.Badge;
const Coupon = lib.Coupon.Coupon;
const Intervals = lib.Coupon.Frequencies;

let pageObject = undefined;

let partyArray = Object.values(Badge.List);

let partyNames = partyArray.map(b =>{
    return b.config.name;
});

let dataForm = Observable.fromObject({
    name: "",
    frequency: Intervals.DAILY,
    final_statement: 0
});

let viewModel = Observable.fromObject({
    dataForm: dataForm,
    finalStatements: partyNames,
    frequencies: [
        {key: Intervals.DAILY, label: "Daily"},
        {key: Intervals.WEEKLY, label: "Weekly"},
        {key: Intervals.MONTHLY, label: "Monthly"},
    ],
});

function onNavigatingTo(args) {
    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;

    pageObject = page.page;
    page.bindingContext = viewModel;

}

function onSwipeCellStarted(args) {
    const swipeLimits = args.data.swipeLimits;
    const swipeView = args.object;

    const deleteButton = swipeView.getViewById("button-delete");

    const width = deleteButton.getMeasuredWidth();

    swipeLimits.right = width;
    swipeLimits.threshold = width / 2;
}

/**
 * Save the config back to the file
 */
function save() {
    Coupon.createWithConfig(dataForm.name, dataForm.frequency, partyArray[dataForm.final_statement].config)
        .then(() => {
            goBack();
            return Promise.resolve()
        })
        .catch(error => {
            Log.catch(error);

            return Dialog.alert({
                title: "Error",
                message: error,
                okButtonText: "Ok"
            }).then(() => {
                return Promise.reject(error);
            });
        });
}

function goBack() {
    topmost().goBack();
}

module.exports.onNavigatingTo = onNavigatingTo;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.goBack = goBack;
module.exports.save = save;
