const Dialog = require("ui/dialogs");
const Observable = require("tns-core-modules/data/observable");
const topmost = require("ui/frame").topmost;

const gData = require("~/app").gData;
const lib = require("~/lib");
const Log = lib.Log.default;
const Badge = lib.pop.Badge;
const Coupon = lib.Coupon;
const Intervals = lib.Coupon.Frequencies;

let pageObject = undefined;

let partyArray = [];
let partyNames = [];
let dataForm = Observable.fromObject({
    name: "",
    frequency: Intervals.DAILY,
    final_statement: ""
});

let viewModel = Observable.fromObject({
    dataForm: dataForm,
    finalStatements: [],
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

    partyArray = gData.badges;
    if (partyArray.length == 0) {
        return Dialog.alert({
            title: "Error",
            message: "No finalized badge available",
            okButtonText: "OK",
        }).then(() => {
            goBack();
        });
    }
    partyNames = partyArray.map(b => {
        return b.config.name;
    });
    dataForm.name = "";
    dataForm.final_statement = partyNames[0];
    viewModel.finalStatements = partyNames;
}

/**
 * Save the config back to the file
 */
function save() {
    let party = partyArray.find(p => {
        return p.config.name == dataForm.final_statement;
    })
    if (party == undefined) {
        Log.error("didn't find chosen party - hoping the final_statement has the correct one");
        party = partyArray[dataForm.final_statement];
    }
    Log.print(dataForm.name, dataForm.frequency);
    Coupon.createWithConfig(dataForm.name, dataForm.frequency, new Date(Date.now()), party)
        .then(coupon => {
            Log.print("new coupon:", coupon);
            coupon._config.showAdmin = true;
            return coupon.saveConfig();
        })
        .then(()=>{
            return goBack();
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
module.exports.goBack = goBack;
module.exports.save = save;
