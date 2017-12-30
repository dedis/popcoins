const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const Frame = require("ui/frame");
const Clipboard = require("nativescript-clipboard");
const Crypto = require("~/shared/lib/dedis-js/src/crypto");
const Misc = require("~/shared/lib/dedis-js/src/misc");

const CiscViewModel = require("./cisc-view-model");
const viewModel =  new CiscViewModel();

function onLoaded(args) {
  const page = args.object;
  page.bindingContext = viewModel;
}

/**
 * Function that gets called when the user wants to generate a new key pair. It guides the user through the process.
 * @returns {Promise.<any>}
 */
function generateKeyPair() {

    /**
     * Generates the new key pair and informs the user.
     * @returns {Promise.<any>}
     */
    function createKeyPair() {
        const pair = Crypto.generateRandomKeyPair();
        const newPublicKeyCothority = Misc.uint8ArrayToHex(Crypto.marshal(pair.getPublic()));
        const newPrivateKey = pair.getPrivate("hex");
        const newPublicKey = pair.getPublic("hex");

        return FileIO.writeStringTo(FilesPath.PUBLIC_KEY, newPublicKey)
            .then(() => {
                return FileIO.writeStringTo(FilesPath.PUBLIC_KEY_COTHORITY, newPublicKeyCothority);
            })
            .then(() => {
                return FileIO.writeStringTo(FilesPath.PRIVATE_KEY, newPrivateKey);
            })
            .then(() => {
                return FileIO.writeStringTo(FilesPath.POP_LINKED_CONODE, "");
            })
            .then(() => {
                return Dialog.confirm({
                    title: "New Key Pair",
                    message: "The public and private keys have been stored in your settings." +
                    "\n\nPublic Key:\n" + newPublicKey + "\nPrivate Key:\n" +
                    newPrivateKey,
                    okButtonText: "Dismiss",
                    cancelButtonText: "Copy Keys to Clipboard & Dismiss"
                })
                    .then(result => {
                        if (result) {
                            return Promise.resolve();
                        } else {
                            return Clipboard.setText("Public:" + newPublicKey + "\nPrivate:" + newPrivateKey);
                        }
                    });
            });
    }

    return FileIO.getStringOf(FilesPath.PUBLIC_KEY_COTHORITY)
        .then(storedPublicKey => {
            if (storedPublicKey.length > 0) {
                return Dialog.confirm({
                    title: "Old Key Pair Overwriting",
                    message: "There is already a key pair stored in you settings. Do you" +
                    " want to overwrite it and generate a new key pair?",
                    okButtonText: "New",
                    cancelButtonText: "Cancel"
                })
                    .then(result => {
                        if (result) {
                            return createKeyPair();
                        } else {
                            return Promise.resolve();
                        }
                    })
                    .catch(() => {
                        return Dialog.alert({
                            title: "Key Pair Generation Error",
                            message: "An unexpected error occurred. Please try again.",
                            okButtonText: "Ok"
                        });
                    });
            } else {
                return createKeyPair();
            }
        })
        .catch(() => {
            return Dialog.alert({
                title: "Key Pair Generation Error",
                message: "An unexpected error occurred. Please try again.",
                okButtonText: "Ok"
            });
        });
}

/**
 * Function called when the "display" button has been pressed, we then navigate to the QR code display frame.
 * @returns {Promise.<any>}
 */
function displayQrOfPublicKey() {
    return FileIO.getStringOf(FilesPath.PUBLIC_KEY)
        .then(publicKey => {
            if (publicKey !== undefined && publicKey.length > 0) {
                Frame.topmost().navigate({
                    moduleName: "drawers/pop/att/qr-code/qr-code-page",
                    bindingContext: {
                        publicKey: publicKey
                    }
                });
            } else {
                return Promise.reject();
            }
        })
        .catch(() => {
            return Dialog.alert({
                title: "Please Generate a Key Pair",
                message: "Either generate a key pair within the app or enter an already" +
                " owned public key (in the settings).",
                okButtonText: "Ok"
            });
        });
}

function chooseName() {
    console.log(viewModel.name);
    if (viewModel.name === "") {
        return Dialog.alert({
            title: "Error",
            message: "Name can't be empty",
            okButtonText: "OK"
        });
    }
    FileIO.writeStringTo(FilesPath.CISC_NAME, viewModel.name)
        .then(() => Dialog.alert({
            title: "Name successfully changed",
            message: `Your're name has been set to "${viewModel.name}"`,
            okButtonText: "OK"
        }))
        .catch((error) => {
        console.log(error);
        Dialog.alert({
            title: "Error",
            message: "An error occured please try again",
            okButtonText:"OK"
        });
    });
}


exports.onLoaded = onLoaded;
exports.chooseName = chooseName;
exports.generateKeyPair = generateKeyPair;
exports.displayQrOfPublicKey = displayQrOfPublicKey;
