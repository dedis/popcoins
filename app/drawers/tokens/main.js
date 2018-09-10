const ScanToReturn = require("../../shared/lib/scan-to-return/scan-to-return");
const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const Timer = require("timer");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../shared/lib/file-io/file-io");
const FilePaths = require("../../shared/res/files/files-path");
const AttParty = require("../../shared/lib/dedjs/object/pop/att/AttParty").Party;
const Convert = require("../../shared/lib/dedjs/Convert");
const PartyStates = require("../../shared/lib/dedjs/object/pop/att/AttParty").States;
const PoP = require("../../shared/lib/dedjs/object/pop/PoP").get;
const POP_TOKEN_OPTION_SIGN = "Sign";
const POP_TOKEN_OPTION_TRANSFER_COINS = "Transfer coins";
const POP_TOKEN_OPTION_REVOKE = "Revoke";
const Net = require("@dedis/cothority").net;
const RequestPath = require("../../shared/lib/dedjs/network/RequestPath");

const USER_CANCELED = "USER_CANCELED_STRING";

const viewModel = ObservableModule.fromObject({
    partyListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let page = undefined;
let timerId = undefined;
let pageObject = undefined;

function listObject(data) {
    // allows us to console.log circular objects, but prints only current level depth
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            console.log(key + " -> " + data[key]);
        }
    }
}

function convertBinaryStringToUint8Array(bStr) {
    var i, len = bStr.length, u8_array = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        u8_array[i] = bStr.charCodeAt(i);
    }
    return u8_array;
}

function onLoaded(args) {
    console.log("tokens: onloaded");
    page = args.object;

    page.bindingContext = viewModel;
    pageObject = args.object.page;
    loadParties()
        .then(() => {
            // Poll the status every 5s
            timerId = Timer.setInterval(() => {
                reloadStatuses();
            }, 5000);

            console.log("tokens: onloaded end");
        });
    // Timer.setInterval(() => {
    //     viewModel.partyListDescriptions.forEach(model => {
    //         console.dir("partylistdescriptions.status.balance is:", model.status.balance);
    //     });
    // }, 5000)
}

function onUnloaded(args) {
    // remove polling when page is leaved
    console.log("tokens: unloading");
    Timer.clearInterval(timerId);
    console.log("tokens: unloading - 2");
}

function loadParties() {
    viewModel.isLoading = true;
    viewModel.isEmpty = true;
    viewModel.partyListDescriptions.splice(0);

    let parties = [];
    FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
        parties.push(AttParty.loadFromDisk(partyFolder.name))
    });

    return Promise.all(parties)
    // .then(parties => {
    //     return Promise.all(
    //         parties.map(party => {
    //             return party.update();
    //         })
    //     )
    // })
        .then(parties => {
            console.log("all parties loaded from disk");
            parties.forEach(party => {
                console.dir("party is:", party);
                // Observables have to be nested to reflect changes
                const partyModule = ObservableModule.fromObject({
                    party: party,
                    desc: party.getPopDescModule(),
                    status: party.getPopStatusModule()
                });
                viewModel.partyListDescriptions.push(partyModule);
                viewModel.isEmpty = false;
            })
            viewModel.isLoading = false;
            pageObject.getViewById("listView").refresh();
        })
        .catch(error => {
            console.dir("error in loading:", error);
        });
}

function partyTapped(args) {
    const index = args.index;
    const status = viewModel.partyListDescriptions.getItem(index).status.status;
    const party = viewModel.partyListDescriptions.getItem(index).party;

    switch (status) {
        case PartyStates.ERROR:
            Dialog.alert({
                title: "Error",
                message: "The conode is offline, please wait until it comes online.",
                okButtonText: "Ok"
            });
            break;
        case PartyStates.PUBLISHED: //RUNNING

        case PartyStates.FINALIZED:

        case PartyStates.POPTOKEN:

            if (!party.isAttendee(party.getKeyPair().public)) {
                return Promise.reject("You are not part of the attendees.");
            }
            if (party.getPopToken() === undefined) {
                party.retrieveFinalStatementAndStatus()
                    .then(() => {
                        return PoP.addPopTokenFromFinalStatement(party.getFinalStatement(), party.getKeyPair(), true, party)
                    })
                    .then(() => {
                        return Frame.topmost().getViewById("listView").refresh()
                    })
                    .catch(error => {
                        Dialog.alert({
                            title: "Error",
                            message: "An error occured, please retry. - " + error,
                            okButtonText: "Ok"
                        });
                        console.log("error: ", error.stack);
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
                                console.log("couldn't scan:", error);

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
                            return party.transferCoin(amount, Convert.base64ToByteArray(publicKeyObject.public), true);
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

                            console.log("wrong number:", err.stack);
                            return Promise.reject(err)
                        })
                    }

                    return Promise.resolve();
                })
                .catch(error => {
                    console.log("error while interacting with token:", error);

                    Dialog.alert({
                        title: "Error",
                        message: "An error occured, please retry. - " + error,
                        okButtonText: "Ok"
                    });

                    return Promise.reject(error);
                });
            break;

        default:
        case PartyStates.FINALIZING:
            Dialog.action({
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
                                    animated: false, clearHistory: true, moduleName: "drawers/tokens/main"
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
                        Dialog.confirm({
                            title: "Deleting party-token",
                            message: "You're about to delete the party-token - \n" +
                                "are you sure?",
                            okButtonText: "Yes, delete",
                            cancelButtonText: "No, keep"
                        })
                            .then(del => {
                                if (del) {
                                    return deleteParty(party);
                                }
                            })
                            .then(() => {
                                viewModel.partyListDescriptions.splice(index, 1);
                                pageObject.getViewById("listView").refresh();
                            })
                            .catch(err => {
                                console.log("error while deleting:", err);
                            })
                    }
                })
                .catch((error) => {
                    Dialog.alert({
                        title: "Error",
                        message: "An error occured, please try again. - " + error,
                        okButtonText: "Ok"
                    });
                    console.log("error while interacting with finalizing token:", error);
                });
            break;
    }
}

function deleteParty(party) {
    return party.remove()
        .then(() => {
            const listView = Frame.topmost().currentPage.getViewById("listView");
            listView.notifySwipeToExecuteFinished();
            return Promise.resolve();
        })
        .catch((error) => {
            console.log("error while deleting party:", error);
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

function addMyself(infos) {
    const newParty = new AttParty(infos.id, infos.omniledgerId, infos.address);
    return newParty.save()
        .then(() => {
            viewModel.partyListDescriptions.push(ObservableModule.fromObject({
                party: newParty,
                desc: newParty.getPopDescModule(),
                status: newParty.getPopStatusModule()
            }));

            console.log("returning new party", newParty.name);
            return newParty
        });
};

function addParty() {
    let parties = []
    let party = {}

    return ScanToReturn.scan()
        .then(string => {
            const infos = Convert.jsonToObject(string);
            return new AttParty(infos.id, infos.omniledgerId, infos.address);
        })
        .catch(error => {
            console.dir("error while scanning:", error);
            return new AttParty("b73b5efd15eb6bd808da4ae7ecd0c696f505172dddfa045aa063c8f92506df05", RequestPath.OMNILEDGER_INSTANCE_ID, "tls://gasser.blue:7002");

            return Dialog.prompt({
                title: "Enter address manually",
                message: "Couldn't scan party-id. Please enter url of server to search for party-ids:",
                okButtonText: "Fetch parties",
                cancelButtonText: "Quit",
                defaultText: "gasser.blue:7002",
                inputType: Dialog.inputType.text
            })
                .then(url => {
                    // if (url == ""){
                    //     throw new Error("no url given")
                    // }
                    console.dir("got", url.text, url.result);
                    console.dir("got", url);
                    const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(url.text, ""), RequestPath.POP);
                    return cothoritySocketPop.send(RequestPath.POP_GET_FINAL_STATEMENTS, RequestPath.POP_GET_FINAL_STATEMENTS_REPLY, {})
                })
                .then(reply => {
                    console.dir("Got final statements:");
                    listObject(reply);
                    let msg = "Enter the number of the party you want to join";
                    for (var fsId in reply.finalstatements) {
                        let fs = reply.finalstatements[fsId];
                        console.log("fsId length is:" + fsId.length);
                        listObject(fs.desc);
                        listObject(fs.attendees);
                        if (fs.attendees.length == 0) {
                            parties.push({
                                id: convertBinaryStringToUint8Array(fsId),
                                address: fs.desc.roster.list[0].address,
                            })
                            msg += "\n" + parties.length + ":" + fs.desc.name + ":" + fs.desc.datetime;
                        }
                    }
                    if (parties.length > 0) {
                        return Dialog.prompt({
                            title: "Chose party",
                            message: msg,
                            okButtonText: "Join Party",
                            cancelButtonText: "Quit",
                            defaultText: "1",
                            inputType: Dialog.inputType.text
                        })
                    } else {
                        throw new Error("no party found");
                    }
                })
                .then(res => {
                    if (res.result == false) {
                        throw new Error("Aborted party choice");
                    }
                    let i = parseInt(res.text);
                    if (i > parties.length) {
                        throw new Error("this party does not exist")
                    }
                    party = parties[i - 1];
                    console.log("party is:", i, party.id.constructor.name);
                    listObject(party.id);
                    const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(party.address, ""), RequestPath.POP);
                    return cothoritySocketPop.send(RequestPath.POP_GET_INSTANCE_ID, RequestPath.POP_GET_INSTANCE_ID_REPLY, {
                        partyID: party.id
                    })
                })
                .then(reply=>{
                    console.dir("reply is:", reply);
                    console.dir("party is:", party);
                    return new AttParty(Convert.byteArrayToHex(reply.instanceID), RequestPath.OMNILEDGER_INSTANCE_ID, party.address);
                })
        })
        .then(newParty => {
            console.log("got party:");
            listObject(newParty);
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
                            animated: false, clearHistory: true, moduleName: "drawers/tokens/main"
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
        .catch(err => {
            console.log("error:", err);
            return Dialog.alert({
                title: "Remote parties",
                message: err,
                okButtonText: "Continue"
            })
                .then(() => {
                    throw new Error(err);
                })
        })
}

function update() {
    pageObject.getViewById("listView").refresh();
}

function reloadStatuses() {
    // console.dir("tokens: reloadStatuses.length=", viewModel.partyListDescriptions.length);
    // console.dir("tokens: reloadStatuses", viewModel.partyListDescriptions);
    Promise.all(viewModel.partyListDescriptions.map(model => {
        // console.dir("desc is:", model.desc);
        // console.dir("status is:", model.status);
        // console.dir("model is:", model);
        return model.party.updateCoinInstance();
        // return Promise.resolve();
    }))
        .then(() => {
            // viewModel.partyListDescriptions.forEach(model => {
            //     console.dir("desc is after update:", model.desc);
            //     console.dir("status is after update:", model.status);
            //     // console.dir("models.foreach:", model);
            //     model.desc = model.party.getPopDescModule();
            //     model.status = model.party.getPopStatusModule();
            // })
            // This is to update the radlistview with the new changes.
            // viewModel.partyListDescriptions = viewModel.partyListDescriptions.slice();
            viewModel.partyListDescriptions.forEach(model => {
                if (!isNaN(model.status.balance)) {
                    model.status.status = PartyStates.FINALIZED;
                }
            });
            return pageObject.getViewById("listView").refresh();
            // console.log("tokens: reloadStatuses done");
        })
        .catch(err => {
            console.log("reloadStat error:", err);
        });
}

function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

module.exports.onDrawerButtonTap = onDrawerButtonTap;
module.exports.onLoaded = onLoaded;
module.exports.partyTapped = partyTapped;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.deleteParty = deleteParty;
module.exports.addParty = addParty;
module.exports.onUnloaded = onUnloaded;
module.exports.loadParties = loadParties;
module.exports.addMyself = addMyself;
