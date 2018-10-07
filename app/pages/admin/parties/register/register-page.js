require("nativescript-nodeify");

const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const topmost = require("ui/frame").topmost;
const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;
const HashJs = require("hash.js");
const Buffer = require("buffer/").Buffer;

const lib = require("../../../../lib");
const Convert = lib.Convert;
const Scan = lib.Scan;
const User = lib.User;
const Log = lib.Log.default;
const Badge = lib.pop.Badge;
const RequestPath = lib.network.RequestPath;

let viewModel = undefined;
let Party = undefined;
let pageObject = undefined;
let isPressed = undefined;
let loadedOrganizers = false;

function onLoaded(args) {
    isPressed = "true";
    const page = args.object;
    pageObject = page.page;
    const context = page.navigationContext;

    if (context.party === undefined) {
        throw new Error("Party should be given in the context");
    }
    Party = context.party;

    viewModel = Observable.fromObject({
        array: new ObservableArray(),
        size: 0,
        hash: ""
    });
    return Promise.resolve()
        .then(() => {
            if (!loadedOrganizers) {
                return Party.fetchAttendees()
                    .catch(err => {
                        Log.catch(err, "couldn't update keys");
                    })
                    .then(keys => {
                        if (keys.length == Party.config.roster.identities.length) {
                            Log.lvl1("got all organizers' keys");
                            loadedOrganizers = true;
                        }
                    })
            }
        })
        .then(() => {
            let hash = HashJs.sha256();
            let keys = Party.attendees.map(att => {
                return Convert.byteArrayToHex(att.marshalBinary());
            });
            keys.sort();

            keys.forEach(a => {
                viewModel.array.push(a);
                hash.update(a);
            });
            viewModel.size = "Attendees: " + Party.attendees.length;
            viewModel.hash = "Hash: " + Buffer.from(hash.digest()).toString('hex').slice(0, 16);

            page.bindingContext = viewModel;
            let finalizeLabel = page.getViewById("finalize");

            // Without this the text is not vertically centered in is own view
            finalizeLabel.android.setGravity(android.view.Gravity.CENTER);
        })
}

function addManual() {
    return Dialog.prompt({
        title: "Public Key",
        message: "Please enter the public key of an attendee.",
        okButtonText: "Register",
        cancelButtonText: "Cancel",
        inputType: Dialog.inputType.text
    })
        .then(args => {
            if (args.result && args.text !== undefined && args.text.length > 0) {
                // Add Key
                let pub = CurveEd25519.point();
                pub.unmarshalBinary(Convert.hexToByteArray(args.text));
                return Party.attendeesAdd([pub]);
            } else {
                // Cancel
                return Promise.resolve();
            }
        })
        .then(() => {
            return Party.save();
        })
        .catch(error => {
            console.log(error);
            console.log(error.stack);

            Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            });

            return Promise.reject(error);
        });
}

function addScan() {
    let returnText = undefined;
    return Scan.scan()
        .then(keyPairJson => {
            const keypair = JSON.parse(keyPairJson);
            let pub = CurveEd25519.point();
            pub.unmarshalBinary(new Uint8Array(Buffer.from(keypair.public, 'base64')));
            return Party.attendeesAdd([pub])
        })
        .then((text) => {
            returnText = text;
            const view = pageObject.getViewById("list-view-registered-keys");
            return view.refresh();
        })
        .then(() => {
            return Party.save();
        })
        .then(() => {
            return returnText;
        })
        .catch(error => {
            console.dir("couldn't add new key:", error);
            return Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            })
                .then(() => {
                    throw new Error("couldn't scan");
                });
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

function deleteAttendee(args) {
    // We do not get the index of the item swiped/clicked...
    const attendee = Convert.byteArrayToBase64(args.object.bindingContext);
    const attendeeList = Party.getRegisteredAtts().slice().map(attendee => {
        return Convert.byteArrayToBase64(attendee);
    });

    const index = attendeeList.indexOf(attendee);

    return Party.unregisterAttendeeByIndex(index)
        .then(() => {
            const listView = Frame.topmost().currentPage.getViewById("list-view-registered-keys");
            listView.notifySwipeToExecuteFinished();

            return Promise.resolve();
        })
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

/**
 * Function called when the button "finalize" is clicked. It starts the registration process with the organizers conode.
 * @returns {Promise.<any>}
 */
function finalize() {
    let pub = CurveEd25519.point();
    pub.mul(User.getKeyPair().private, null);
    return Party.finalize(User.getKeyPair().private)
        .then((result) => {

            if (result === Badge.STATE_FINALIZING) {
                isPressed = "false";
                return Dialog.alert({
                    title: "Finalizing",
                    message: "Finalize order has been sent but not all other conodes finalized yet.",
                    okButtonText: "Ok"
                });
            }
            return Dialog.alert({
                title: "Success",
                message: "The final statement of your PoP-Party is now accessible to the attendees.",
                okButtonText: "Ok"
            });
        })
        .then(() => {
            return topmost().goBack();
        })
        .catch(error => {
            Log.catch(error);
            return Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            }).then(() => {
                return Promise.reject(error);
            });
        });
}

function addNewKey() {
    const choices = ["SCAN NEXT", "Stop scanning"]
    addScan().then(function (text) {
        setTimeout(() => {
            Dialog.confirm({
                title: "Scanned key",
                message: text,
                okButtonText: choices[0],
                cancelButtonText: choices[1]
            })
                .then(ok => {
                    if (ok) {
                        addNewKey();
                    }
                })
        })
    })
}

function shareToAttendee() {
    let info = {
        id: Party.config.hashStr(),
        omniledgerId: RequestPath.OMNILEDGER_INSTANCE_ID,
        address: Party.linkedConode.tcpAddr
    };
    pageObject.showModal("shared/pages/qr-code/qr-code-page", {
        textToShow: Convert.objectToJson(info),
        title: "Party information"
    }, () => {
    }, true);
}

function goBack() {
    return topmost().goBack();
}

function deleteParty() {
    Dialog.confirm({
        title: "Deleting party",
        message: "You're about to delete the party - \n" +
            "are you sure?",
        okButtonText: "Yes, delete",
        cancelButtonText: "No, keep"
    })
        .then(del => {
            if (del) {
                return Party.remove()
                    .then(() => {
                        topmost().goBack();
                    })
                    .catch(err => {
                        Log.catch(err);
                    })
            }
        })
}

function keyTapped(arg) {
    const key = Buffer.from(viewModel.array.getItem(arg.index), 'hex');
    Frame.topmost().currentPage.showModal("shared/pages/qr-code/qr-code-page", {
        textToShow: " { \"public\" :  \"" + Buffer.from(key).toString('base64') + "\"}",
        title: "Public Key",
    }, () => {
    }, true);
}

module.exports.keyTapped = keyTapped;
module.exports.deleteParty = deleteParty;
module.exports.onLoaded = onLoaded;
module.exports.addManual = addManual;
module.exports.addScan = addScan;
module.exports.finalize = finalize;
module.exports.deleteattendee = deleteAttendee;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.addNewKey = addNewKey;
module.exports.goBack = goBack;
module.exports.shareToAttendee = shareToAttendee;
