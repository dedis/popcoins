const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const Frame = require("ui/frame");
const Clipboard = require("nativescript-clipboard");
const Crypto = require("~/shared/lib/dedis-js/src/crypto");
const Misc = require("~/shared/lib/dedis-js/src/misc");

const CiscViewModel = require("./cisc-view-model");

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new CiscViewModel();
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
    function generateKeyPair() {
        const pair = Crypto.generateRandomKeyPair();
        const newPublicKey = Misc.uint8ArrayToHex(Crypto.marshal(pair.getPublic()));
        const newPrivateKey = pair.getPrivate("hex");

        return FileIO.writeStringTo(FilesPath.PUBLIC_KEY, newPublicKey)
            .then(() => {
                return FileIO.writeStringTo(FilesPath.PRIVATE_KEY, newPrivateKey);
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

    return FileIO.getStringOf(FilesPath.PUBLIC_KEY)
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
                            return generateKeyPair();
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
                return generateKeyPair();
            }
        })
        .catch((error) => {
            console.log(error);
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

exports.onLoaded = onLoaded;
exports.generateKeyPair = generateKeyPair;
exports.displayQrOfPublicKey = displayQrOfPublicKey;
