require("nativescript-nodeify");
const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const Timer = require("timer");
const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const PlatformModule = require("tns-core-modules/platform");
const ZXing = require("nativescript-zxing");
const ImageSource = require("image-source");
const QRGenerator = new ZXing();
// const Net = require("@dedis/cothority").net;

const lib = require("../../shared/lib");
const dedjs = lib.dedjs;
const ScanToReturn = lib.scan_to_return;
const AttParty = dedjs.object.pop.att.AttParty.Party;
const Convert = dedjs.Convert;
const Log = dedjs.Log;
const PoP = dedjs.object.pop.PoP.get;
const Wallet = dedjs.object.pop.Wallet;
const Net = dedjs.network.NSNet;
const RequestPath = dedjs.network.RequestPath;

const USER_CANCELED = "Cancel";

const viewModel = Observable.fromObject({
    partyListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let page = undefined;
let timerId = undefined;
let pageObject = undefined;

function convertBinaryStringToUint8Array(bStr) {
    let len = bStr.length, u8_array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        u8_array[i] = bStr.charCodeAt(i);
    }
    return u8_array;
}

function onLoaded(args) {
    console.log("tokens: onloaded");
    page = args.object;

    page.bindingContext = viewModel;
    pageObject = args.object.page;
    return loadParties();
}

function onUnloaded(args) {
    // remove polling when page is leaved
    console.log("tokens: unloading");
    Timer.clearInterval(timerId);
    console.log("tokens: unloading - 2");
}

/**
 * Creates a view-model for better updating.
 * @param wallet{Wallet}
 * @returns {Observable}
 */
function getViewModel(wallet) {
    let pubBase64 = Buffer.from(wallet.keypair.public.marshalBinary()).toString('base64');
    let text = " { \"public\" :  \"" + pubBase64 + "\"}";
    Log.print("QRcode is:", text);
    let sideLength = PlatformModule.screen.mainScreen.widthPixels / 4;
    const qrcode = QRGenerator.createBarcode({
        encode: text,
        format: ZXing.QR_CODE,
        height: sideLength,
        width: sideLength
    });

    let balance = "unknown";
    if (wallet.state() == Wallet.STATE_TOKEN) {
        balance = wallet.balance;
    }

    return Observable.fromObject({
        party: wallet,
        desc: Observable.fromObjectRecursive({
            name: wallet.config.name,
            datetime: wallet.config.datetime,
            location: wallet.config.location,
            roster: {
                id: wallet.config.roster.id,
                list: new ObservableArray(wallet.config.roster.list),
                aggregate: new Uint8Array()
            }
        }),
        status: Observable.fromObject({
            status: wallet.stateStr(),
            qrcode: ImageSource.fromNativeSource(qrcode),
            balance: balance
        })
    })
}

function loadParties() {
    viewModel.isLoading = true;
    return Wallet.loadAll()
        .then(wallets => {
            viewModel.partyListDescriptions.splice(0);
            Object.values(wallets).forEach(wallet => {
                viewModel.partyListDescriptions.push(getViewModel(wallet));
            });

            viewModel.isEmpty = viewModel.partyListDescriptions.length === 0;
            viewModel.isLoading = false;

            // Poll the status every 5s
            timerId = Timer.setInterval(() => {
                reloadStatuses();
            }, 5000)
        })
        .catch(err => {
            console.log("error while loading party: " + err);
            viewModel.isLoading = false;
        });
}

function partyTapped(args) {
    const index = args.index;
    const party = viewModel.partyListDescriptions.getItem(index).party;

    const WALLET_DELETE = "Delete";
    const WALLET_SHOW = "Show";
    const WALLET_SIGN = "Sign service";
    const WALLET_TRANSFER = "Transfer coins";

    let actions = [WALLET_SHOW, WALLET_DELETE];
    if (party.state() == Wallet.STATE_TOKEN) {
        actions.unshift(WALLET_TRANSFER, WALLET_SIGN)
    }
    // return Frame.topmost().getViewById("listView").refresh()
    return Dialog.action({
        message: "Choose an Action",
        cancelButtonText: "Cancel",
        actions: actions
    }).then(result => {
        switch (result) {
            case WALLET_DELETE:
                Dialog.confirm({
                    title: "Deleting party-token",
                    message: "You're about to delete the party-token - \n" +
                        "are you sure?",
                    okButtonText: "Yes, delete",
                    cancelButtonText: "No, keep"
                })
                    .then(del => {
                        if (del) {
                            return party.remove()
                                .then(() => {
                                    viewModel.partyListDescriptions.splice(index, 1);
                                    pageObject.getViewById("listView").refresh();
                                })
                        }
                    })
                    .catch(err => {
                        console.log("error while deleting:", err);
                    })
            case WALLET_SHOW:
                return Frame.topmost().navigate({
                    moduleName: "drawers/pop/org/config/config-page",
                    context: {
                        wallet: party,
                        readOnly: true
                    }
                });
            case WALLET_SIGN:
                return ScanToReturn.scan()
                    .then(signDataJson => {
                        const sigData = Convert.jsonToObject(signDataJson);
                        const sig = PoP.signWithPopToken(party.getPopToken(),
                            Convert.hexToByteArray(sigData.nonce), Convert.hexToByteArray(sigData.scope));

                        const fields = {
                            signature: Convert.byteArrayToHex(sig)
                        };

                        return pageObject.showModal("shared/pages/qr-code/qr-code-page", {
                            textToShow: Convert.objectToJson(fields),
                            title: "Signed informations"
                        });
                    })
                    .catch(error => {
                        console.log("couldn't scan:", error);

                        if (error !== ScanToReturn.SCAN_ABORTED) {
                            setTimeout(() => {
                                return Dialog.alert({
                                    title: "Error",
                                    message: "An error occured, please retry. - " + error,
                                    okButtonText: "Ok"
                                });
                            });
                        }

                    });
            case WALLET_TRANSFER:
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
    });
}

function addParty() {
    return ScanToReturn.scan()
        .then(string => {
            const infos = Convert.jsonToObject(string);
            return Wallet.MigrateFrom.conodeGetWallet(infos.address,
                infos.omniledgerId, infos.id);
        })
        .catch(error => {
            console.dir("error while scanning:", error);
            return Dialog.prompt({
                // This is for the iOS simulator that doesn't have a
                // camera - in the simulator it's easy to copy/paste the
                // party-id, whereas on a real phone you wouldn't want
                // to do that.
                title: "Party-ID",
                message: "Couldn't scan party-id. Please enter party-id manually.",
                okButtonText: "Join Party",
                cancelButtonText: "Quit",
                defaultText: "",
                inputType: Dialog.inputType.text
            }).then(r => {
                if (r) {
                    return Wallet.MigrateFrom.conodeGetWallet("tls://gasser.blue:7002", RequestPath.OMNILEDGER_INSTANCE_ID, r.text);
                } else {
                    throw new Error("Aborted party-id");
                }
            })

        })
        .then(newWallet => {
            console.log("got wallet:");
            newWallet.attendeesAdd([newWallet.keypair.public]);
            Log.print("Roster is:", newWallet.config.roster);
            return newWallet.save()
                .then(() => {
                    Log.print("saved");
                    viewModel.partyListDescriptions.push(
                        getViewModel(newWallet)
                    );

                    return update();
                })
                .then(() => {
                    Log.print("updated");
                    return Frame.topmost().navigate({
                        animated: false, clearHistory: true, moduleName: "drawers/tokens/main"
                    })
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
            }).then(() => {
                throw new Error(err);
            })
        })
}

function update() {
    pageObject.getViewById("listView").refresh();
}

function reloadStatuses() {
    Promise.all(viewModel.partyListDescriptions.map(model => {
        return model.party.update();
    }))
        .then(() => {
            viewModel.partyListDescriptions.forEach(model => {
                model.status.status = model.party.stateStr();
                if (model.party.state() == Wallet.STATE_TOKEN) {
                    model.status.balance = model.party.balance;
                }
            });
            return pageObject.getViewById("listView").refresh();
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
module.exports.addParty = addParty;
module.exports.onUnloaded = onUnloaded;
module.exports.loadParties = loadParties;


// Not used for the moment, but might be useful later
function fetchParties() {
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
            console.dir(reply);
            let msg = "Enter the number of the party you want to join";
            for (var fsId in reply.finalstatements) {
                let fs = reply.finalstatements[fsId];
                console.log("fsId length is:" + fsId.length);
                console.dir(fs.desc);
                console.dir(fs.attendees);
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
            console.dir(party.id);
            const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(party.address, ""), RequestPath.POP);
            return cothoritySocketPop.send(RequestPath.POP_GET_INSTANCE_ID, RequestPath.POP_GET_INSTANCE_ID_REPLY, {
                partyID: party.id
            })
        })
        .then(reply => {
            console.dir("reply is:", reply);
            console.dir("party is:", party);
            return new AttParty(Convert.byteArrayToHex(reply.instanceID), RequestPath.OMNILEDGER_INSTANCE_ID, party.address);
        })
}