const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const Observable = require("tns-core-modules/data/observable");
const topmost = require("ui/frame").topmost;

const lib = require("../../../../lib");
const Convert = lib.Convert;
const Scan = lib.Scan;
const FileIO = lib.FileIO;
const FilePaths = lib.FilePaths;
const Coupon = lib.Coupon;
const Helper = lib.Helper;
const ObjectType = lib.ObjectType;
const User = lib.User;
// const PoP = require("../../../lib/dedjs/object/pop/PoP").get;
const Coupon = lib.Coupon.Coupon;
const Intervals = lib.Coupon.Frequencies;

let pageObject = undefined;

let finalStatementsMap = PoP.getFinalStatements().map((statement, index) => {
    return {key: index, label: statement.desc.name};
});

let dataForm = Observable.fromObject({
    name: "",
    frequency: Intervals.DAILY,
    final_statement: 0
});

let viewModel = Observable.fromObject({
    dataForm: dataForm,
    finalStatements: finalStatementsMap,
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
    Coupon.createWithConfig(dataForm.name, dataForm.frequency, PoP.getFinalStatements().getItem(dataForm.final_statement))
        .then(() => {
            goBack();
            return Promise.resolve()
        })
        .catch(error => {
            console.log(error);
            console.dir(error);
            console.trace();

            Dialog.alert({
                title: "Error",
                message: error,
                okButtonText: "Ok"
            });

            return Promise.reject(error);
        });
}

function goBack() {
    topmost().goBack();
}

module.exports.onNavigatingTo = onNavigatingTo;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.goBack = goBack;
module.exports.save = save;
