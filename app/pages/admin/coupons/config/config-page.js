const Dialog = require("ui/dialogs");
const Observable = require("tns-core-modules/data/observable");
const topmost = require("ui/frame").topmost;

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

    partyArray = [];
    Badge.List.forEach(b =>{
        if (b.state() === Badge.STATE_TOKEN){
            partyArray.push(b);
        }
    });
    if (partyArray.length == 0){
        return Dialog.alert("No finalized badge available")
            .then(()=>{
                goBack();
            });
    }
    partyNames = partyArray.map(b =>{
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
    let party = partyArray.find(p =>{
        return p.config.name == dataForm.final_statement;
    })
    if (party == undefined){
        Log.error("didn't find chosen party - hoping the final_statement has the correct one");
        party = partyArray[dataForm.final_statement];
    }
    Coupon.createWithConfig(dataForm.name, dataForm.frequency, new Date(Date.now()), party)
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
module.exports.goBack = goBack;
module.exports.save = save;
