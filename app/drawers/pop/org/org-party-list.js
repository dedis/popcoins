const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const Timer = require("timer");
const Wallet = require("../../../shared/lib/dedjs/object/pop/Wallet");
const User = require("../../../shared/lib/dedjs/object/user/User").get;
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Convert = require("../../../Convert");
const Helper = require("../../../Helper");
const ObjectType = require("../../../ObjectType");
const Net = require("@dedis/cothority").net;
const CothorityMessages = require("../../../network/cothority-messages");
const RequestPath = require("../../../network/RequestPath");
const DecodeType = require("../../../network/DecodeType");

const CANCELED_BY_USER = "CANCELED_BY_USER_STRING";

const viewModel = ObservableModule.fromObject({
    partyListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let page = undefined;
let timerId = undefined;

function onLoaded(args) {
    console.log("party-list loading");
    page = args.object;
    page.bindingContext = viewModel;

    Timer.setTimeout(() => {
        loadParties();
    }, 10);
}

function onUnloaded() {
    console.log("party-list unloading")
    // remove polling when page is leaved
    Timer.clearInterval(timerId);
}

/**
 * Gets all the parties from the Wallet. If it's the first time, the wallet will load them from
 * disk/sd-card/whatever. Else it will only return the cached list of wallets.
 */
function loadParties() {
    viewModel.isLoading = true;
    Wallet.loadAll()
        .then(wallets => {
            viewModel.partyListDescriptions.splice(0);
            wallets.forEach(wallet => {
                viewModel.partyListDescriptions.push(getViewModel(wallet));
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
 * @returns {ObservableModule}
 */
function getViewModel(wallet) {
    return ObservableModule.fromObject({
        party: wallet,
        desc: ObservableModule.fromObjectRecursive({
            name: wallet.config.name,
            datetime: wallet.config.datetime,
            location: wallet.config.location,
            roster: {
                id: wallet.config.roster.id,
                list: new ObservableArray(wallet.config.roster.list),
                aggregate: new Uint8Array()
            }
        }),
        status: ObservableModule.fromObject({
            status: wallet.state()
        })
    })
}


/**
 * Asks all models to update their status and recreates the view.
 * @returns {Promise<any[]>}
 */
function reloadStatuses() {
    let newView = ObservableArray();
    return Promise.all(
        viewModel.partyListDescriptions.map(model => {
                return model.party.update()
                    .then(() => {
                        newView.push(getViewModel(model.party));
                    })
            }
        ).then(() => {
            viewModel.partyListDescriptions = newView;
        }))
}


/**
 * If the party is in published status, then we show the register-page. Else we present different
 * options depending on the state of the party.
 * @param args
 * @returns {*}
 */
function partyTapped(args) {
    const index = args.index;
    const party = viewModel.partyListDescriptions.getItem(index).party;
    if (party._status() == Wallet.STATE_PUBLISH) {
        return Frame.topmost().navigate({
            moduleName: "drawers/pop/org/register/register-page",
            context: {
                party: party
            }
        });
    }

    let CONFIG = "Configure the party";
    let PUBLISH = "Publish the party";
    let DELETE = "Remove the party";
    let actions = [DELETE];
    if (party.status() == Wallet.STATE_CONFIG) {
        actions = [CONFIG, PUBLISH, DELETE];
    }
    return Dialog.action({
        title: "Party",
        message: "What do you want to do ?",
        cancelButtonText: "Cancel",
        actions: actions
    }).then(result => {
        if (result === CONFIG) {
            return Frame.topmost().navigate({
                moduleName: "drawers/pop/org/config/config-page",
                context: {
                    party: party
                }
            });
        } else if (result === PUBLISH) {
            return party.publish();
        } else if (result === DELETE) {
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
    if (!User.isKeyPairSet()) {
        return Dialog.alert({
            title: "Key Pair Missing",
            message: "Please generate a key pair.",
            okButtonText: "Ok"
        });
    }

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
            return sendLinkRequest(conodes[index], "")
                .then(result => {
                    console.log("Prompting for pin");
                    if (result.alreadyLinked !== undefined && result.alreadyLinked) {
                        console.log("Already linked")
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
                    console.log("couldn't get PIN: " + error);
                })
        } else {
            return Promise.reject(CANCELED_BY_USER);
        }
    }).catch(error => {
        console.log("error while setting up pin: ", error);

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
    let conode = undefined;
    verifyLinkToConode()
        .then((result) => {
            conode = result;
            return Dialog.action({
                message: "You are linked to your conode ! What do you want to do ?",
                cancelButtonText: "Cancel",
                actions: ["Configure a new party", "List the proposals"]
            })
        })
        .then(result => {
            console.dir("result is:", result);
            if (result === "Configure a new party") {
                console.log("configuring a new party");
                Frame.topmost().navigate({
                    moduleName: "drawers/pop/org/config/config-page",
                    context: {
                        party: newParty,
                        leader: conode,
                        newParty: true
                    }
                });
            } else if (result === "List the proposals") {
                Frame.topmost().navigate({
                    moduleName: "drawers/pop/org/proposals/org-party-proposals",
                    context: {
                        conode: conode,
                    }
                });

                return Promise.reject("New party is not needed anymore");
            } else {
                return Promise.reject("User canceled");
            }

            return Promise.resolve()
        })
        .catch(() => {
            newParty.remove();
        });

}

module.exports.onLoaded = onLoaded;
module.exports.partyTapped = partyTapped;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.deleteParty = deleteParty;
module.exports.addParty = addParty;
module.exports.onUnloaded = onUnloaded;
module.exports.hashAndSave = hashAndSave;

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
    if (!Helper.isOfType(conode, ObjectType.SERVER_IDENTITY)) {
        throw new Error("conode must be an instance of ServerIdentity");
    }
    if (typeof pin !== "string") {
        throw new Error("pin must be of type string");
    }
    if (!User.isKeyPairSet()) {
        throw new Error("user should generate a key pair before linking to a conode");
    }
    const ALREADY_LINKED = "ALREADY_LINKED_STRING";
    const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(conode, ""), RequestPath.POP);
    const pinRequestMessage = CothorityMessages.createPinRequest(pin, User.getKeyPair().public);
    const verifyLinkMessage = CothorityMessages.createVerifyLinkMessage(User.getKeyPair().public);

    // TODO change status request return type
    console.log("verify link");
    return cothoritySocket.send(RequestPath.POP_VERIFY_LINK, DecodeType.VERIFY_LINK_REPLY, verifyLinkMessage)
        .then(alreadyLinked => {
            console.log("sending request");
            return alreadyLinked.exists ?
                Promise.resolve(ALREADY_LINKED) :
                cothoritySocket.send(RequestPath.POP_PIN_REQUEST, RequestPath.STATUS_REQUEST, pinRequestMessage)
        })
        .then(response => {
            console.log("set linked");
            return this.setLinkedConode(conode, true)
                .then(() => {
                    const fields = {
                        alreadyLinked: response === ALREADY_LINKED
                    };
                    return Promise.resolve(fields);
                })

        })
        .catch(error => {
            console.log("link error: " + error.message);
            if (error.message === CothorityMessages.READ_PIN_ERROR) {
                return Promise.resolve(error.message)
            }
            console.log("link error:", error);

            return Promise.reject(error);
        });
}


/**
 * TO DELETE
 */

function hashAndSave(party) {

    if (!User.isKeyPairSet()) {
        return Dialog.alert({
            title: "Key Pair Missing",
            message: "Please generate a key pair.",
            okButtonText: "Ok"
        })
            .then(() => {
                throw new Error("Key Pair Missing");
            });
    }
    if (!party.isPopDescComplete()) {
        return Dialog.alert({
            title: "Missing Information",
            message: "Please provide a name, date, time, location and the list (min 3) of conodes" +
                " of the organizers of your PoP Party.",
            okButtonText: "Ok"
        })
            .then(() => {
                throw new Error("Missing information");
            });
    }
    if (!party.isLinkedConodeSet()) {
        return Dialog.alert({
            title: "Not Linked to Conode",
            message: "Please link to a conode first.",
            okButtonText: "Ok"
        })
            .then(() => {
                throw new Error("Not linked to Conode");
            });
    }

    return party.registerPopDesc()
        .then(() => {
            return party.loadStatus();
        })
        // .then(() => {
        //     return Dialog.alert({
        //         title: "Successfully Registered",
        //         message: "Your party has been correctly published ! You can now register the public key of each attendee.",
        //         okButtonText: "Ok"
        //     });
        // })
        .then(() => {
            console.log("adding myself to party");
            return addMyselfAttendee(party);
        })
        .then(() => {
            console.log("sending my public key to server");
            console.dir(party.getRegisteredAtts());
            let pubKey = party.getRegisteredAtts().getItem(0);
            console.log("Pubkey is:", pubKey);
            return party.storeOrganizer(pubKey);
        })
        .then(() => {
            console.log("fetching other keys");
            return party.fetchOrganizerKeys()
                .catch(err => {
                    console.log("non-fatal error while fetching keys:", err)
                    return [];
                });
        })
        .then(keys => {
            console.log("all keys registered:", keys.length);
        })
        .catch(error => {
            console.log("error while adding my key:", error);

            return Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            })
                .then(() => {
                    throw new Error("couldn't add key: " + error);
                });
        });
}


const addMyselfAttendee = require("./register/register-page").addMyselfAttendee;

