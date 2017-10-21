const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const Frame = require("ui/frame");
const Clipboard = require("nativescript-clipboard");

const AttViewModel = require("./att-view-model");

let textFieldPrivateKey = undefined;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  loadViews(page);
  if (textFieldPrivateKey === undefined) {
    throw new Error("a field is undefined, but it shouldn't");
  }

  page.bindingContext = new AttViewModel();
}

/**
 * Loads the needed views of the text fields.
 * @param page - the current page object
 */
function loadViews(page) {
  textFieldPrivateKey = page.getViewById("text-field-private-key");
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
    // TODO: actually generate the key pair
    const newPublicKey = "public.key";
    const newPrivateKey = "private.key";

    return FileIO.writeContentTo(FilesPath.POP_PUBLIC_KEY, newPublicKey)
                 .then(() => {
                   return Dialog.confirm({
                                           title: "New Key Pair",
                                           message: "The public key has been stored in your settings. Please store" +
                                                    " your private key securely, after dismissing this message you" +
                                                    " won't be able to retrieve the private key through the" +
                                                    " app.\n\nPublic Key:\n" + newPublicKey + "\nPrivate Key:\n" +
                                                    newPrivateKey,
                                           okButtonText: "Dismiss",
                                           cancelButtonText: "Copy Private Key to Clipboard & Dismiss"
                                         })
                                .then(result => {
                                  if (result) {
                                    return Promise.resolve();
                                  } else {
                                    return Clipboard.setText(newPrivateKey);
                                  }
                                });
                 });
  }

  return FileIO.getContentOf(FilesPath.POP_PUBLIC_KEY)
               .then(storedPublicKey => {
                 if (storedPublicKey.length > 0) {
                   return Dialog.confirm({
                                           title: "Old Key Pair Overwriting",
                                           message: "There is already a public key stored in you settings. Do you" +
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
  return FileIO.getContentOf(FilesPath.POP_PUBLIC_KEY)
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

/**
 * Function called when the user clicks on the "generate pop token" button. When the user provided all needed
 * information the pop token will be generated.
 * @returns {Promise.<any>}
 */
function generatePopToken() {
  const privateKey = textFieldPrivateKey.text;

  return FileIO.getContentOf(FilesPath.POP_FINAL_TOML)
               .then(finalToml => {
                 if (privateKey.length > 0 && finalToml.length > 0) {
                   return Dialog.confirm({
                                           title: "PoP Token Generation",
                                           message: "Private Key:\n" + privateKey + "\nFinal Toml:\n" + finalToml,
                                           okButtonText: "Generate",
                                           cancelButtonText: "Cancel"
                                         })
                                .then(result => {
                                  if (result) {
                                    textFieldPrivateKey.text = "";
                                    // TODO: generate the PoP Token
                                  } else {
                                    return Promise.resolve();
                                  }
                                });
                 } else {
                   return Promise.reject();
                 }
               })
               .catch(() => {
                 return Dialog.alert({
                                       title: "Provide More Information",
                                       message: "Please provide a private key and store the text of your final.toml" +
                                                " in the settings.",
                                       okButtonText: "Ok"
                                     });
               });
}

exports.onLoaded = onLoaded;
exports.generateKeyPair = generateKeyPair;
exports.displayQrOfPublicKey = displayQrOfPublicKey;
exports.generatePopToken = generatePopToken;
