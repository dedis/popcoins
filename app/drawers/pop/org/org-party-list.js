require("nativescript-nodeify");
const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const Timer = require("timer");
const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;
const Cothority = require("@dedis/cothority");

const lib = require("../../../shared/lib");
const dedjs = lib.dedjs;
const Wallet = dedjs.object.pop.Wallet;
const Configuration = dedjs.object.pop.Configuration;
const User = dedjs.object.user.get;
const Convert = dedjs.Convert;
const Log = dedjs.Log;
const CothorityMessages = dedjs.network.CothorityMessages;
const RequestPath = dedjs.network.RequestPath;
const DecodeType = dedjs.network.DecodeType;
const Net = dedjs.network.NSNet;

const CANCELED_BY_USER = "CANCELED_BY_USER_STRING";

const viewModel = Observable.fromObject({
    partyListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true,
    loaded: false
});

let page = undefined;
let timerId = undefined;

function onLoaded(args) {
    Log.lvl2("party-list loading");
    page = args.object;
    page.bindingContext = viewModel;

    viewModel.partyListDescriptions.splice(0);

    Log.print("User public key is:", User.getKeyPair().public);

    return Timer.setTimeout(() => {
        loadParties();
    }, 10);
}

function onUnloaded() {
    Log.lvl2("party-list unloading")
    // remove polling when page is leaved
    Timer.clearInterval(timerId);
}

/**
 * Gets all the parties from the Wallet. If it's the first time, the wallet will load them from
 * disk/sd-card/whatever. Else it will only return the cached list of wallets.
 */
function loadParties() {
    return Promise.resolve()
        .then(() => {
            if (!viewModel.loaded) {
                Log.lvl1("loading wallets from disk");
                viewModel.isLoading = true;
                viewModel.loaded = true;
                return Wallet.loadAll()
                    .catch(err => {
                        Log.rcatch(err, "error while loading party: ");
                        viewModel.isLoading = false;
                    })
            }
        })
        .then(() => {
            Log.lvl1("getting all wallets:", Object.keys(Wallet.List));
            viewModel.partyListDescriptions.splice(0);
            Object.values(Wallet.List).forEach(wallet => {
                if (wallet.linkedConode) {
                    viewModel.partyListDescriptions.push(getViewModel(wallet));
                }
            })

            viewModel.isEmpty = viewModel.partyListDescriptions.length == 0;
            viewModel.isLoading = false;

            // Poll the status every 5s
            timerId = Timer.setInterval(() => {
                reloadStatuses();
            }, 5000)
        })
}

/**
 * Creates a view-model for better updating.
 * @param wallet{Wallet}
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
            if (model.party.state() == Wallet.STATE_CONFIG) {
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
    if (party.state() == Wallet.STATE_PUBLISH) {
        return Frame.topmost().navigate({
            moduleName: "drawers/pop/org/register/register-page",
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
    if (party.state() == Wallet.STATE_CONFIG) {
        actions = [CONFIG, PUBLISH, DELETE];
    } else if (party.state() == Wallet.STATE_FINALIZED) {
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
                let newParty = new Wallet(party.config);
            case CONFIG:
                return Frame.topmost().navigate({
                    moduleName: "drawers/pop/org/config/config-page",
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

    return Dialog.action({
        message: "Choose a Conode",
        cancelButtonText: "Cancel",
        actions: conodesNames
    }).then(result => {
        if (result !== "Cancel") {
            index = conodesNames.indexOf(result);
            Log.lvl2("index is:", index);
            return sendLinkRequest(conodes[index], "")
                .then(result => {
                    Log.lvl2("Prompting for pin");
                    if (result.alreadyLinked !== undefined && result.alreadyLinked) {
                        Log.lvl2("Already linked");
                        return Promise.resolve(conodes[index])
                    }
                    return Dialog.prompt({
                        title: "Requested PIN",
                        message: result,
                        okButtonText: "Link",
                        cancelButtonText: "Cancel",
                        defaultText: "",
                        inputType: Dialog.inputType.text
                    }).then(result => {
                        if (result.result) {
                            if (result.text === "") {
                                return Promise.reject("PIN should not be empty");
                            }
                            return sendLinkRequest(conodes[index], result.text)
                                .then(() => {
                                    return Promise.resolve(conodes[index]);
                                });
                        } else {
                            return Promise.reject(CANCELED_BY_USER);
                        }
                    });

                }).catch(error => {
                    Log.lvl2("couldn't get PIN: " + error);
                })
        } else {
            return Promise.reject(CANCELED_BY_USER);
        }
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
    });
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
    let wallet = new Wallet(config);

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
                Log.lvl2("configuring a new party");
                return Frame.topmost().navigate({
                    moduleName: "drawers/pop/org/config/config-page",
                    context: {
                        wallet: wallet,
                        leader: wallet.linkedConode,
                        newConfig: true
                    }
                });
            } else if (result === "List the proposals") {
                return Frame.topmost().navigate({
                    moduleName: "drawers/pop/org/proposals/org-party-proposals",
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
            console.dir("error while adding a party: " + err)
        });
}

module.exports = {
    onLoaded,
    partyTapped,
    addParty,
    onUnloaded,
}

/**
 * TO BE MOVED ELSEWHERE
 */

/**
 * Sends a link request to the conode given as parameter. If the pin is not empty and the link request succeeds
 * or if the public key of the user is already registered, the conode will be stored as the linked conode.
 * @param {ServerIdentity} conode - the conode to which send the link request
 * @param {string} pin - the pin received from the conode
 * @returns {Promise} - a promise that gets completed once the link request has been sent and a response received
 * @property {boolean} alreadyLinked -  a property of the object returned by the promise that tells if
 * the public key of the user were already registered (thus it won't need to ask PIN in the future)
 */
function sendLinkRequest(conode, pin) {
    if (!(conode instanceof Cothority.ServerIdentity)) {
        throw new Error("conode must be an instance of Cothority.ServerIdentity");
    }
    if (typeof pin !== "string") {
        throw new Error("pin must be of type string");
    }
    const ALREADY_LINKED = "ALREADY_LINKED_STRING";
    const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(conode, ""), RequestPath.POP);
    const pinRequestMessage = CothorityMessages.createPinRequest(pin, User.getKeyPair().public);
    const verifyLinkMessage = CothorityMessages.createVerifyLinkMessage(User.getKeyPair().public);

    // TODO change status request return type
    Log.lvl2("verify link");
    return cothoritySocket.send(RequestPath.POP_VERIFY_LINK, DecodeType.VERIFY_LINK_REPLY, verifyLinkMessage)
        .then(alreadyLinked => {
            Log.lvl2("sending pin request");
            return alreadyLinked.exists ?
                Promise.resolve(ALREADY_LINKED) :
                cothoritySocket.send(RequestPath.POP_PIN_REQUEST, RequestPath.STATUS_REQUEST, pinRequestMessage)
        })
        .then(response => {
            Log.lvl2("already linked");
            return {
                alreadyLinked: response === ALREADY_LINKED
            };
        })
        .catch(error => {
            Log.catch(error, "link error");
            if (error.message === CothorityMessages.READ_PIN_ERROR) {
                return Promise.resolve(error.message)
            }
            return Promise.reject(error);
        });
}
