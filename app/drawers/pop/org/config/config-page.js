const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const topmost = Frame.topmost;
const Observable = require("tns-core-modules/data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;

const lib = require("../../../../shared/lib");
const dedjs = lib.dedjs;
const Wallet = dedjs.object.pop.Wallet;
const User = dedjs.object.user.get;
const Convert = dedjs.Convert;
const Helper = dedjs.Helper;
const ObjectType = dedjs.ObjectType;
const ScanToReturn = lib.scan_to_return;


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
    console.log("config-page");

    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;
    const context = page.navigationContext;

    if (context.wallet === undefined || !WalEdit instanceof Wallet) {
        throw new Error("WalEdit should be given as a Wallet in the context");
    }
    WalEdit = context.wallet;

    newConfig = context.newConfig;
    let cfg = WalEdit.config;

    dataForm.name = cfg.name;
    dataForm.date = cfg.datetime;
    dataForm.time = cfg.datetime;
    dataForm.location = cfg.location;
    viewModel.dataForm = dataForm;
    viewModel.readOnly = context.readOnly === true;
    console.log("readOnly is:", viewModel.readOnly);

    console.dir(cfg.roster);
    cfg.roster.list.forEach(conode => {
        viewModel.rosterList.push(conode);
    })

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
        message: "How would you like to add the new organizer ?",
        cancelButtonText: cancel,
        actions: actions
    }).then(result => {
        console.log("Dialog result: " + result);
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
    console.log("conode tapped:", args)
    const index = args.index;
    const remove = "Remove this conode";
    return Dialog.action({
        message: "What do you want to do ?",
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
            console.log("removing conode: " + index);
            delete WalEdit.config.roster.list[index];
        }
    }).catch((error) => {
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
                    console.log(error);
                    console.dir(error);
                    console.trace();

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
                const conodes = User.getRoster().list;
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

                        console.log("adding a new conode: " + conodes[index]);
                        // TODO: adding conode to the configuration
                        WalEdit.config.roster.list.push(conodes[index]);
                    }
                }).catch(error => {
                    console.log("error while adding a conode: " + error);
                });
            }
        }).catch(error => {
            console.log("error while adding a conode: " + error);

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
    return ScanToReturn.scan()
        .then(string => {
            const conode = Convert.parseJsonServerIdentity(string);

            console.log("adding new conode: " + conode);
            WalEdit.config.roster.list.push(conode);
            pageObject.getViewById("list-view-conodes").refresh();
        })
        .catch(error => {
            console.log("error while scanning conode: " + error);

            if (error !== ScanToReturn.SCAN_ABORTED) {
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
function getViewModelDate() {
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

    return new Date(date[0], date[1], date[2], time[0], time[1], 0, 0);
}

/**
 * TODO: return the actual roster of the party.
 * @returns {Roster}
 */
function getViewModelRoster() {
    return User.getRoster();
}

function goBack() {
    return topmost().goBack();
}

function save() {
    WalEdit.config.name = viewModel.dataForm.name;
    WalEdit.config.datetime = getViewModelDate().toString();
    WalEdit.config.location = viewModel.dataForm.location;
    WalEdit.config.roster = getViewModelRoster();
    return WalEdit.save()
        .then(() => {
            return goBack();
        })
}

function removeAndGoBack() {
    if (!newConfig) {
        return WalEdit.remove()
            .catch((error) => {
                console.log("Configuration could not be deleted: " + error);
            }).then(() => {
                return goBack();
            });
    }

    goBack();
}

module.exports = {
    onNavigatingTo,
    goBack,
    addConode,
    removeAndGoBack,
    conodeTapped,
    save,
}
