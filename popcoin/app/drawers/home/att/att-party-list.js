const ScanToReturn = require("../../../shared/lib/scan-to-return/scan-to-return");
const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const Timer = require("timer");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../../shared/lib/file-io/file-io");
const FilePaths = require("../../../shared/res/files/files-path");
const AttParty = require("../../../shared/lib/dedjs/object/pop/att/AttParty").Party;
const Convert = require("../../../shared/lib/dedjs/Convert");
const PartyStates = require("../../../shared/lib/dedjs/object/pop/att/AttParty").States;
const PoP = require("../../../shared/lib/dedjs/object/pop/PoP").get;
var platform = require("tns-core-modules/platform");
var Directory = require("../../../shared/lib/Directory/Directory");
const POP_TOKEN_OPTION_SIGN = "Sign";
const POP_TOKEN_OPTION_TRANSFER_COINS = "Transfer coins";
const POP_TOKEN_OPTION_REVOKE = "Revoke";
const repeaterModule = require("tns-core-modules/ui/repeater");
const Buffer = require("buffer").Buffer;

const USER_CANCELED = "USER_CANCELED_STRING";

const viewModel = ObservableModule.fromObject({
    partyListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});
let loaded = false;
let page = undefined;
let timerId = undefined;
let pageObject = undefined;

function onNavigatingTo(args) {
    console.log("navigating to");
    pageObject = args.object.page;
}

function onLoaded(args) {
    page = args.object;

    page.bindingContext = viewModel;
    pageObject = args.object.page;
    console.log("loaded is: " + loaded);
    loaded = false;
    if (!loaded) {
        loadParties();
        pageObject.getViewById("listView").refresh();

        loaded = true;
    }

    // Poll the status every 3s
    timerId = Timer.setInterval(() => {
        reloadStatuses();
    }, 5000);
}

function onUnloaded(args) {
    // remove polling when page is leaved
    Timer.clearInterval(timerId);
}

function loadParties() {
    console.log("loading parties");
    viewModel.isLoading = true;

    // Bind isEmpty to the length of the array
    viewModel.partyListDescriptions.on(ObservableArray.changeEvent, () => {
        viewModel.set('isEmpty', viewModel.partyListDescriptions.length === 0);
    });

    viewModel.partyListDescriptions.splice(0);

    FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
        console.log("loading party: " + partyFolder.name);
        AttParty.loadFromDisk(partyFolder.name).then((party) => {
            // Observables have to be nested to reflect changes
            viewModel.partyListDescriptions.push(ObservableModule.fromObject({
                party: party,
                desc: party.getPopDescModule(),
                status: party.getPopStatusModule()
            }));
        });

    });

    viewModel.isLoading = false;
}

function partyTapped(args) {


    const index = args.index;
    const status = viewModel.partyListDescriptions.getItem(index).status.status;
    const party = viewModel.partyListDescriptions.getItem(index).party;
    console.log(party)


    switch (status) {
        case PartyStates.ERROR:
            Dialog.alert({
                title: "Error",
                message: "The conode is offline, please wait until it comes online.",
                okButtonText: "Ok"
            });
            break;
        case PartyStates.PUBLISHED: //RUNNING

        case PartyStates.FINALIZING:
            Dialog
                .action({
                    message: "What do you want to do ?",
                    cancelButtonText: "Cancel",
                    actions: ["Generate a new key pair", "Show the QR Code of my public key", "Display Party Info", "Delete Party"]
                })
                .then(result => {
                    if (result === "Generate a new key pair") {
                        return Dialog.confirm({
                            title: "Warning !",
                            message: "The current key pair will by overwritten, so will need to get the new one " +
                                "registered by the organizers. Are you sure you want to continue ?",
                            okButtonText: "Yes",
                            cancelButtonText: "No",
                        })
                            .then(accepted => {
                                return !accepted ? Promise.resolve() : (party.randomizeKeyPair().then(Frame.topmost().navigate({
                                    animated: false, clearHistory: true, moduleName: "drawers/home/home-page"
                                })))
                                    .then(() => {
                                        return Dialog.alert({
                                            title: "A new key pair has been generated !",
                                            message: "You can now use it to register to this party.",
                                            okButtonText: "Ok"
                                        })
                                    })
                            })
                    } else if (result === "Show the QR Code of my public key") {
                        Frame.topmost().currentPage.showModal("shared/pages/qr-code/qr-code-page", {
                            textToShow: " { \"public\" :  \"" + Convert.byteArrayToBase64(party.getKeyPair().public) + "\"}",
                            title: "Public Key",

                        }, () => {
                        }, true);
                    } else if (result === "Display Party Info") {
                        Frame.topmost().navigate({
                            moduleName: "drawers/pop/org/config/config-page",
                            context: {
                                party: party,
                                readOnly: true
                            }
                        });
                    } else if (result === "Delete Party") {
                        deleteParty(party);
                        viewModel.partyListDescriptions.splice(index, 1)

                    }
                })
                .catch((error) => {
                    Dialog.alert({
                        title: "Error",
                        message: "An error occured, please try again. - " + error,
                        okButtonText: "Ok"
                    });
                    console.log(error);
                    console.dir(error);
                    console.trace(error);
                });
            break;
        case PartyStates.FINALIZED:

        case PartyStates.POPTOKEN:

            if (!party.isAttendee(party.getKeyPair().public)) {

                return Promise.reject("You are not part of the attendees.");

            }
            if (party.getPopToken() === undefined) {
                PoP.addPopTokenFromFinalStatement(party.getFinalStatement(), party.getKeyPair(), true, party)
                    .then(() => {
                        return Frame.topmost().getViewById("listView").refresh()
                    })
                    .catch(error => {
                        Dialog.alert({
                            title: "Error",
                            message: "An error occured, please retry. - " + error,
                            okButtonText: "Ok"
                        });
                        console.log(error.stack);
                    });
            }


            return Dialog.action({
                message: "Choose an Action",
                cancelButtonText: "Cancel",
                actions: [POP_TOKEN_OPTION_SIGN, POP_TOKEN_OPTION_TRANSFER_COINS]
            })
                .then(result => {
                    if (result === POP_TOKEN_OPTION_REVOKE) {
                        // Revoke Token
                        return PoP.revokePopTokenByIndex(args.index);
                    } else if (result === POP_TOKEN_OPTION_SIGN) {
                        return ScanToReturn.scan()
                            .then(signDataJson => {
                                console.dir(signDataJson);
                                const sigData = Convert.jsonToObject(signDataJson);
                                const sig = PoP.signWithPopToken(party.getPopToken(), Convert.hexToByteArray(sigData.nonce), Convert.hexToByteArray(sigData.scope));

                                const fields = {
                                    signature: Convert.byteArrayToHex(sig)
                                };

                                setTimeout(() => {
                                    pageObject.showModal("shared/pages/qr-code/qr-code-page", {
                                        textToShow: Convert.objectToJson(fields),
                                        title: "Signed informations"
                                    }, () => {
                                    }, true);
                                }, 1);

                                return Promise.resolve()
                            })
                            .catch(error => {
                                console.log(error);
                                console.dir(error);
                                console.trace();

                                if (error !== ScanToReturn.SCAN_ABORTED) {
                                    setTimeout(() => {
                                        Dialog.alert({
                                            title: "Error",
                                            message: "An error occured, please retry. - " + error,
                                            okButtonText: "Ok"
                                        });
                                    });
                                }

                            })
                    } else if (result === POP_TOKEN_OPTION_TRANSFER_COINS) {
                        let amount = undefined;
                        const USER_WRONG_INPUT = "USER_WRONG_INPUT";

                        return Dialog.prompt({
                            title: "Amount",
                            message: "Please choose the amount of PoP-Coin you want to transfer",
                            okButtonText: "Transfer",
                            cancelButtonText: "Cancel",
                            defaultText: "",
                        }).then((r) => {
                            if (!r.result) {
                                return Promise.reject(USER_CANCELED)
                            }
                            amount = Number(r.text);
                            if (isNaN(amount) || !(Number.isInteger(amount))) {
                                return Promise.reject(USER_WRONG_INPUT)
                            }
                            return ScanToReturn.scan()
                        }).then(publicKeyJson => {
                            const publicKeyObject = Convert.jsonToObject(publicKeyJson);
                            return party.transferCoin(amount, Convert.base64ToByteArray(publicKeyObject.public));
                        }).then(() => {
                            return Dialog.alert({
                                title: "Success !",
                                message: "" + amount + " PoP-Coins have been transferred",
                                okButtonText: "Ok"
                            });
                        }).catch(err => {
                            if (err === USER_CANCELED) {
                                return Promise.resolve()
                            } else if (err === USER_WRONG_INPUT) {
                                return Dialog.alert({
                                    title: "Wrong input",
                                    message: "You can only enter an integer number. Please try again.",
                                    okButtonText: "Ok"
                                });

                            }

                            console.log(err.stack);

                            return Promise.reject(err)
                        })
                    }

                    return Promise.resolve();
                })
                .catch(error => {
                    console.log(error);
                    console.dir(error);
                    console.trace();

                    Dialog.alert({
                        title: "Error",
                        message: "An error occured, please retry. - " + error,
                        okButtonText: "Ok"
                    });

                    return Promise.reject(error);
                });
            break;

        default:
            Dialog.alert({
                title: "Not implemented",
                okButtonText: "Ok"
            })
    }
}

function deleteParty(party) {

    party.remove()
        .then(() => {
            const listView = Frame.topmost().currentPage.getViewById("listView");
            listView.notifySwipeToExecuteFinished();

            return Promise.resolve();
        })
        .catch((error) => {
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

function onSwipeCellStarted(args) {
    const swipeLimits = args.data.swipeLimits;
    const swipeView = args.object;

    const deleteButton = swipeView.getViewById("button-delete");

    const width = deleteButton.getMeasuredWidth();

    swipeLimits.right = width;
    swipeLimits.threshold = width / 2;
}

module.exports.addMyself = function (infos) {
    const newParty = new AttParty(infos.id, infos.omniledgerId, infos.address);
    return newParty.save().then(() => {
        viewModel.partyListDescriptions.push(ObservableModule.fromObject({
            party: newParty,
            desc: newParty.getPopDescModule(),
            status: newParty.getPopStatusModule()
        }));

        return Promise.resolve(newParty)
    });
};

function addParty() {
    return ScanToReturn.scan()
        .then(string => {
            const infos = Convert.jsonToObject(string);
            const newParty = new AttParty(infos.id, infos.omniledgerId, infos.address);


            return newParty.save()
                .then((st) => {
                    viewModel.partyListDescriptions.push(ObservableModule.fromObject({
                        party: newParty,
                        desc: newParty.getPopDescModule(),
                        status: newParty.getPopStatusModule()
                    }));

                    update();
                    return newParty.update()
                        .then(Frame.topmost().navigate({
                            animated: false, clearHistory: true, moduleName: "drawers/home/home-page"
                        }));
                })
                .catch(error => {
                    Dialog.alert({
                        title: "Saving error",
                        message: "Couldn't save the party: " + error,
                        okButtonText: "OK"
                    });
                });
        })
        .catch(error => {
            console.log(error);
            console.dir(error);
            console.trace();
            if (error !== ScanToReturn.SCAN_ABORTED) {
                setTimeout(() => {
                    Dialog.alert({
                        title: "Error",
                        message: "An error occured, please try again. - " + error,
                        okButtonText: "Ok"
                    });
                });
            }

            return Promise.reject(error);
        });

}

function update() {
    pageObject.getViewById("listView").refresh();

    if (page.frame !== undefined) {
        Frame.topmost().getViewById("listView").refresh();
    }
}

function reloadStatuses() {


    if (page.frame !== undefined) {
        Frame.topmost().getViewById("repeater").refresh();
    }
    viewModel.partyListDescriptions.forEach(model => {


        model.party.update()

            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

            });
    })
}


module.exports.onLoaded = onLoaded;
module.exports.partyTapped = partyTapped;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.deleteParty = deleteParty;
module.exports.addParty = addParty;
module.exports.onUnloaded = onUnloaded;
module.exports.onNavigatingTo = onNavigatingTo;
module.exports.loadParties = loadParties;
