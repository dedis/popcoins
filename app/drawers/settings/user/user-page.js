const Dialog = require("ui/dialogs");
const Crypto = require("../../../shared/lib/dedjs/Crypto");
const Convert = require("../../../shared/lib/dedjs/Convert");
const User = require("../../../shared/lib/dedjs/object/user/User").get;
const ObservableModule = require("data/observable");

//const viewModel = User.getKeyPairModule();

const viewModel = ObservableModule.fromObject({
    privateKey: Convert.byteArrayToHex(User.getKeyPairModule().private),
    publicKey: Convert.byteArrayToHex(User.getKeyPairModule().public),
    nameModule: User.getName()
});

let textFieldPublic = undefined;
let textFieldPrivate = undefined;
let textFieldUserName = undefined;

let pageObject = undefined;

function onLoaded(args) {
    const page = args.object;
    pageObject = page.parent.page;

    loadViews(page);
    if (textFieldPublic === undefined || textFieldPrivate === undefined) {
        throw new Error("one of the fields is undefined, but it shouldn't");
    }

    page.bindingContext = viewModel;
}

/**
 * Loads the needed views of the text fields.
 * @param page - the current page object
 */
function loadViews(page) {
    textFieldPublic = page.getViewById("text-field-public");
    textFieldPrivate = page.getViewById("text-field-private");
    textFieldUserName = page.getViewById("text-field-username");
}

/**
 * Function that gets called when the user wants to generate a new key pair.
 * @returns {Promise.<any>}
 */
function generateKeyPair() {
    return Dialog.confirm({
        title: "Old Key Pair Overwriting",
        message: "There is already a key pair stored in your settings. Do you" +
            " want to overwrite it and generate a new key pair?",
        okButtonText: "Yes",
        cancelButtonText: "Cancel"
    })
        .then(result => {
            if (result) {
                return setNewKeyPair();
            }

            return Promise.resolve();
        });
}

/**
 * Function called when the "QR" button has been pressed, we then navigate to the QR code display frame.
 * @returns {Promise.<any>}
 */
function displayQrOfPublicKey() {
    const keyPair = User.getKeyPair();
    delete keyPair.private;

    pageObject.showModal("shared/pages/qr-code/qr-code-page", {
        textToShow: Convert.objectToJson(keyPair),
        title: "Public Key"
    }, () => {
    }, true);
}

function changeUserName() {
    const oldUsername = User.getName();
    const username = textFieldUserName.text;
    console.log(oldUsername);
    console.log(username);
    if ((oldUsername !== username)) {
        return Dialog.confirm({
            title: "Alert",
            message: "You are about to change your username from " + oldUsername + " to " + username + " please confirm",
            okButtonText: "Change name",
            cancelButtonText: "Cancel"
        })
            .then(result => {
                if (result) {
                    return User.setName(username, true)
                        .then(() => {
                            return Dialog.alert({
                                title: "Information",
                                message: "Name has been changed to " + User.getName(),
                                okButtonText: "Ok"
                            });
                        });
                }

                return Promise.resolve();
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Dialog.alert({
                    title: "Error",
                    message: "An unexpected error occurred. Please try again. - " + error,
                    okButtonText: "Ok"
                });

                return Promise.reject(error);
            })
    }
}

function resetUser() {
    return Dialog.confirm({
        title: "ALERT",
        message: "You are about to completely reset the user, this action can NOT be undone! Please confirm.",
        okButtonText: "Reset",
        cancelButtonText: "Cancel"
    })
        .then(result => {
            if (result) {
                return User.reset()
                    .then(() => {
                        return Dialog.alert({
                            title: "User Has Been Reset",
                            message: "Everything belonging to the user has been completely reset.",
                            okButtonText: "Ok"
                        });
                    });
            }

            return Promise.resolve();
        })
        .catch(error => {
            console.log(error);
            console.dir(error);
            console.trace();

            return Dialog.alert({
                title: "Error",
                message: "An unexpected error occurred. Please try again. - " + error,
                okButtonText: "Ok"
            });

            return Promise.reject(error);
        });
}

module.exports.onLoaded = onLoaded;
module.exports.generateKeyPair = generateKeyPair;
module.exports.displayQrOfPublicKey = displayQrOfPublicKey;
module.exports.changeUserName = changeUserName;
module.exports.resetUser = resetUser;
