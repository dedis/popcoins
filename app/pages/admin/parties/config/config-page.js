const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const topmost = Frame.topmost;
const Observable = require("tns-core-modules/data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;

const gData = require("~/app").gData;
const lib = require("~/lib");
const Data = lib.Data;
const Convert = lib.Convert;
const Scan = lib.Scan;
const FileIO = lib.FileIO;
const FilePaths = lib.FilePaths;
const Coupon = lib.Coupon;
const Helper = lib.Helper;
const ObjectType = lib.ObjectType;
const User = lib.User;
const Log = lib.Log.default;
const Badge = lib.pop.Badge;

let WalEdit = undefined;
let newConfig = undefined;
let pageObject = undefined;

let dataForm = Observable.fromObject({
    name: "",
    date: "",
    time: "",
    location: ""
});

let viewModel = Observable.fromObject({
    dataForm: dataForm,
    rosterList: new ObservableArray(),
    readOnly: true
});

function onNavigatingTo(args) {
    Log.lvl1("starting config-page");

    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;
    const context = page.navigationContext;

    WalEdit = context.wallet;
    if (WalEdit === undefined || !(WalEdit instanceof Badge.Badge)) {
        throw new Error("WalEdit should be given as a Badge in the context");
    }
    newConfig = context.newConfig;

    viewModel.readOnly = context.readOnly === true;

    copyWalletToViewModel();

    pageObject = page.page;
    page.bindingContext = viewModel;

    if (newConfig && context.leader === undefined) {
        throw new Error("Leader conode should be given in the context");
    }
    return pageObject.getViewById("list-view-conodes").refresh();
}

function addConode() {
    let actions = ["Scan QR", "Enter manually", "Chose from list"];
    let cancel = "Cancel";
    return Dialog.action({
        message: "How would you like to add the new organizer?",
        cancelButtonText: cancel,
        actions: actions
    }).then(result => {
        Log.lvl2("Dialog result: " + result);
        switch (result) {
            case cancel:
                return;
            case actions[0]:
                return addScan();
            default:
                return addManual(result === actions[1]);
        }
    });
}

function conodeTapped(args) {
    const index = args.index;
    const remove = "Remove this conode";
    return Dialog.action({
        message: "What do you want to do?",
        cancelButtonText: "Cancel",
        actions: [remove]
    }).then(result => {
        if (result === remove) {
            if (index === 0) {
                return Dialog.alert({
                    title: "Error",
                    message: "You cannot remove the leader conode",
                    okButtonText: "Ok"
                });
            }
            Log.lvl2("removing conode: " + index);
            delete WalEdit.config.roster.list[index];
        }
    }).catch((error) => {
        Log.catch(error);
        Dialog.alert({
            title: "Error",
            message: "An error occured, please try again. - " + error,
            okButtonText: "Ok"
        });
    });

}

/**
 * Changes the frame to be able to add a conode manually.
 */
function addManual(manually) {
    function enterNewConode(server) {
        if (server !== undefined && !Helper.isOfType(server, ObjectType.SERVER_IDENTITY)) {
            throw new Error("server must be an instance of ServerIdentity or undefined to be skipped");
        }

        if (server !== undefined) {
            return Party.addPopDescConode(server)
                .catch(error => {
                    Log.catch(error);

                    Dialog.alert({
                        title: "Error",
                        message: "An error occured, please try again. - " + error,
                        okButtonText: "Ok"
                    });

                    return Promise.reject(error);
                });
        }
    }

    return Promise.resolve()
        .then(() => {
            if (manually) {
                // Enter the node manually
                return pageObject.showModal("shared/pages/add-conode-manual/add-conode-manual", undefined, enterNewConode, true);
            } else {
                // Chose from list of existing nodes.
                const conodes = User.getRoster().identities;
                const conodesNames = conodes.map(serverIdentity => {
                    return serverIdentity.description;
                });

                let index = undefined;

                return Dialog.action({
                    message: "Choose a Conode",
                    cancelButtonText: "Cancel",
                    actions: conodesNames
                }).then(result => {
                    if (result !== "Cancel") {
                        index = conodesNames.indexOf(result);

                        // TODO: adding conode to the configuration
                        WalEdit.config.roster.identities.push(conodes[index]);
                    }
                }).catch(error => {
                    Log.catch(error, "error while adding a conode: ");
                });
            }
        }).catch(error => {
            Log.catch(error, "error while adding a conode: ");

            return Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            }).then(() => {
                throw new Error(error);
            })
        });
}

/**
 * Add a new conode by scanning it
 *
 * @returns {Promise}
 */
function addScan() {
    return Scan.scan()
        .then(string => {
            const conode = Convert.parseJsonServerIdentity(string);

            WalEdit.config.roster.identities.push(conode);
            pageObject.getViewById("list-view-conodes").refresh();
        })
        .catch(error => {
            Log.catch(error, "error while scanning conode: ");

            if (error !== Scan.SCAN_ABORTED) {
                return Dialog.alert({
                    title: "Error",
                    message: "An error occured, please try again. - " + error,
                    okButtonText: "Ok"
                });
            }
        });
}

/**
 * Parse the date from the data form and return it as date.
 * @return {Date}
 */
function copyViewModelToWallet() {
    let date = viewModel.dataForm.date.split("-");
    let time = viewModel.dataForm.time.split(":");

    if (date.length !== 3 || time.length !== 2) {
        return Dialog.alert({
            title: "Internal error",
            message: "Cannot parse date or time.",
            okButtonText: "Ok"
        }).then(() => {
            throw new Error("Cannot parse date or time");
        });
    }

    date.map(parseInt);
    time.map(parseInt);

    WalEdit.config.datetime = new Date(date[0], date[1]-1, date[2], time[0], time[1], 0, 0).toString();
    WalEdit.config.name = dataForm.name;
    WalEdit.config.location = dataForm.location;
}


function copyWalletToViewModel() {
    let cfg = WalEdit.config;
    let date = new Date(Date.parse(cfg.datetime));

    dataForm.set("date", date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate());
    dataForm.set("time", date.getHours() + ":" + date.getMinutes());
    dataForm.name = cfg.name;
    dataForm.location = cfg.location;
    viewModel.rosterList.splice(0);
    cfg.roster.identities.forEach(conode => {
        viewModel.rosterList.push(conode);
    })
}

/**
 * TODO: return the actual roster of the party.
 * @returns {Roster}
 */
function getViewModelRoster() {
    return User.roster;
}

function goBack() {
    return topmost().goBack();
}

function save() {
    copyViewModelToWallet();
    WalEdit.config.roster = getViewModelRoster();
    return Promise.resolve()
        .then(() => {
            if (WalEdit.state() >= Badge.STATE_PUBLISH) {
                return WalEdit.save()
                    .catch(err => {
                        Log.catch(err, "couldn't save: ");
                    });
            } else {
                return Promise.resolve()
                    .then(() => {
                        gData.addParty(WalEdit);
                    });
            }
        })
        .then(() => {
            return goBack();
        })
}

module.exports = {
    onNavigatingTo,
    goBack,
    addConode,
    conodeTapped,
    save,
}
