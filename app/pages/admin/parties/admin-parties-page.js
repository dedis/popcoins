require("nativescript-nodeify");
const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const Timer = require("timer");
const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;

const lib = require("~/lib");
const Badge = lib.pop.Badge;
const Configuration = lib.pop.Configuration.default;
const User = lib.User;
const Log = lib.Log.default;
const RequestPath = lib.network.RequestPath;

const CANCELED_BY_USER = "CANCELED_BY_USER_STRING";

const viewModel = Observable.fromObject({
    partyListDescriptions: new ObservableArray(),
    isLoading: true,
    isEmpty: true,
    loaded: false,
});

let page = undefined;
let timerId = undefined;

function onNavigatingTo(args) {
    if (args) {
        page = args.object;
        page.bindingContext = viewModel;
    }

    viewModel.partyListDescriptions.splice(0);

    // DEBUG
    if (page) {
        timerId = Timer.setTimeout(() => {
            return loadParties()
                .then(() => {
                    // Poll the status every 5s
                    timerId = Timer.setInterval(() => {
                        return reloadStatuses();
                    }, 5000)
                })
                .catch(err => {
                    Log.catch(err);
                })
        }, 100);
    }
}

function onNavigatedFrom() {
    // remove polling when page is leaved
    Timer.clearInterval(timerId);
}

/**
 * Gets all the parties from the Badge. If it's the first time, the wallet will load them from
 * disk/sd-card/whatever. Else it will only return the cached list of wallets.
 */
function loadParties() {
    return Promise.resolve()
        .then(() => {
            Log.lvl1("getting all wallets:", Badge.List.map(b => {
                return b.config.name
            }));
            viewModel.partyListDescriptions.splice(0);
            Badge.List.forEach(wallet => {
                if (wallet.linkedConode) {
                    viewModel.partyListDescriptions.push(getViewModel(wallet));
                }
            })

            viewModel.isEmpty = viewModel.partyListDescriptions.length == 0;
            viewModel.isLoading = false;
        })
}

/**
 * Creates a view-model for better updating.
 * @param wallet{Badge}
 * @returns {Observable}
 */
function getViewModel(wallet) {
    return Observable.fromObject({
        party: wallet,
        desc: Observable.fromObjectRecursive({
            name: wallet.config.name,
            datetime: wallet.config.datetime,
            location: wallet.config.location,
            roster: {
                id: wallet.config.roster.id,
                list: new ObservableArray(wallet.config.roster.identities),
                aggregate: new Uint8Array()
            }
        }),
        status: Observable.fromObject({
            status: wallet.stateStr()
        })
    })
}


/**
 * Asks all models to update their status and recreates the view.
 * @returns {Promise<any[]>}
 */
function reloadStatuses() {
    let newView = new ObservableArray();
    return Promise.all(
        viewModel.partyListDescriptions.map(model => {
            newView.push(getViewModel(model.party));
            if (model.party.state() == Badge.STATE_CONFIG ||
                model.party.state() == Badge.STATE_TOKEN) {
                return
            }
            return model.party.update()
                .catch(err => {
                    Log.catch(err, "error while updating party");
                })
        })
    ).then(() => {
        viewModel.partyListDescriptions = newView;
    })
}


/**
 * If the party is in published status, then we show the register-page. Else we present different
 * options depending on the state of the party.
 * @param args
 * @returns {*}
 */
function partyTapped(args) {
    const index = args.index;
    const pld = viewModel.partyListDescriptions.getItem(index);
    const party = pld.party;
    if (party.state() == Badge.STATE_PUBLISH) {
        return Frame.topmost().navigate({
            moduleName: "pages/admin/parties/register/register-page",
            context: {
                party: party
            }
        });
    }

    let CONFIG = "Configure the party";
    let PUBLISH = "Publish the party";
    let ADD_NEXT = "Add next party";
    let DELETE = "Remove the party";
    let actions = [DELETE];
    if (party.state() == Badge.STATE_CONFIG) {
        actions = [CONFIG, PUBLISH, DELETE];
    } else if (party.state() == Badge.STATE_FINALIZED) {
        actions = [ADD_NEXT, DELETE];
    }
    return Dialog.action({
        title: "Party",
        message: "What do you want to do ?",
        cancelButtonText: "Cancel",
        actions: actions
    }).then(result => {
        switch (result) {
            case ADD_NEXT:
                let newParty = new Badge(party.config);
            case CONFIG:
                return Frame.topmost().navigate({
                    moduleName: "pages/admin/parties/config/config-page",
                    context: {
                        wallet: party
                    }
                });
            case PUBLISH:
                Log.lvl2("public key2 is:", User.getKeyPair().public);
                const pub = CurveEd25519.point().mul(User.getKeyPair().private, null);
                Log.lvl2("calculated pubkey:", pub);
                return party.publish(User.getKeyPair().private)
                    .then(() => {
                        pld.status.status = party.stateStr();
                    });
            case DELETE:
                return Dialog.confirm({
                    title: "Removing the party",
                    message: "Are you sure to remove the party?",
                    okButtonText: "Yes, remove",
                    cancelButtonText: "No, keep",
                }).then(res => {
                    if (res) {
                        return party.remove()
                            .then(() => {
                                viewModel.partyListDescriptions.splice(index, 1);
                            });
                    }
                })
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
 * Creates a link to a conode by sending a public key protected by a pin-code.
 * @param party
 * @returns {*}
 */
function verifyLinkToConode() {
    const conodes = User.roster.identities;
    const conodesNames = conodes.map(serverIdentity => {
        return serverIdentity.description;
    });

    let index = undefined;

    return Promise.resolve()
        .then(() => {
            if (conodesNames.length == 0) {
                return Dialog.alert({
                    message: "Please add a conode",
                    okButtonText: "OK"
                }).then(() => {
                    throw new Error("No conodes available")
                })
            }
        }).then(() => {
            return Dialog.action({
                message: "Choose a Conode",
                cancelButtonText: "Cancel",
                actions: conodesNames
            }).then(result => {
                if (result == "Cancel") {
                    throw new Error("Cancelled choice of conode");
                } else {
                    index = conodesNames.indexOf(result);
                    Log.lvl2("index is:", index);
                    return User.sendLinkRequest(conodes[index], "")
                        .catch(error => {
                            Log.rcatch(error);
                        }).then(result => {
                            Log.lvl2("Prompting for pin");
                            if (result.alreadyLinked !== undefined && result.alreadyLinked) {
                                Log.lvl2("Already linked");
                                return Promise.resolve(conodes[index])
                            }
                            return Dialog.prompt({
                                title: "Requested PIN",
                                message: "Please look up the PIN in the server log",
                                okButtonText: "Link",
                                cancelButtonText: "Cancel",
                                defaultText: "",
                                inputType: Dialog.inputType.text
                            }).then(result => {
                                if (result.result) {
                                    if (result.text === "") {
                                        return Promise.reject("PIN should not be empty");
                                    }
                                    return User.sendLinkRequest(conodes[index], result.text)
                                        .then(() => {
                                            return Promise.resolve(conodes[index]);
                                        });
                                } else {
                                    return Promise.reject(CANCELED_BY_USER);
                                }
                            });
                        }).catch(error => {
                            Log.catch(error, "error while setting up pin");

                            if (error !== CANCELED_BY_USER) {
                                return Dialog.alert({
                                    title: "Error",
                                    message: "An unexpected error occurred. Please try again. - " + error,
                                    okButtonText: "Ok"
                                }).then(() => {
                                    throw new Error("Couldn't setup pin: " + error);
                                });
                            }
                            return Promise.reject(error);
                        })
                }
            })
        })
}


function addParty() {
    Log.lvl2("configuring a new party");
    let date = new Date();
    let name = "";
    let location = "";
    if (RequestPath.PREFILL_PARTY) {
        name = "test " + date.getHours() + ":" + date.getMinutes();
        location = "testing-land";
    }
    let config = new Configuration(name, date.toString(), location, User.roster);
    let wallet = new Badge.Badge(config);

    verifyLinkToConode()
        .then((result) => {
            wallet.linkedConode = result;
            return Dialog.action({
                message: "You are linked to your conode ! What do you want to do ?",
                cancelButtonText: "Cancel",
                actions: ["Configure a new party", "List the proposals"]
            })
        })
        .then(result => {
            if (result === "Configure a new party") {
                Log.lvl2("configuring a new party", wallet.config.name);
                return Frame.topmost().navigate({
                    moduleName: "pages/admin/parties/config/config-page",
                    context: {
                        wallet: wallet,
                        leader: wallet.linkedConode,
                        newConfig: true
                    }
                });
            } else if (result === "List the proposals") {
                Log.lvl2("listing proposals");
                return Frame.topmost().navigate({
                    moduleName: "pages/admin/parties/proposals/proposals-page",
                    context: {
                        conode: wallet.linkedConode,
                    }
                });
            } else {
                return Promise.reject("User canceled");
            }

            return Promise.resolve()
        })
        .catch(err => {
            Log.catch("error while adding a party: " + err)
        });
}

module.exports = {
    onNavigatingTo: onNavigatingTo,
    onNavigatedFrom: onNavigatedFrom,
    partyTapped,
    addParty,
}

