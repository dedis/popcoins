const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const Frame = require("ui/frame");

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

function generatePopToken() {
  const privateKey = textFieldPrivateKey.text;

  return FileIO.getContentOf(FilesPath.POP_FINAL_TOML)
               .then(finalToml => {
                 if (privateKey.length > 0 && finalToml.length > 0) {
                   return Dialog.confirm({
                                           title: "PoP Token Generation",
                                           message: "Private Key: " + privateKey + "\nFinal Toml: " + finalToml,
                                           okButtonText: "Generate",
                                           cancelButtonText: "Cancel"
                                         })
                                .then(result => {
                                  if (result) {
                                    textFieldPrivateKey.text = "";
                                    // TODO: generate the PoP Token
                                  } else {
                                    return Promise.reject();
                                  }
                                })
                                .catch(() => {
                                  // The user cancelled the PoP token generation.
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
exports.displayQrOfPublicKey = displayQrOfPublicKey;
exports.generatePopToken = generatePopToken;
