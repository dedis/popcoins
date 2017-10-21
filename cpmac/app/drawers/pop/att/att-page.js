const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");

const Frame = require("ui/frame");

const AttViewModel = require("./att-view-model");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new AttViewModel();
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

exports.onNavigatingTo = onNavigatingTo;
exports.displayQrOfPublicKey = displayQrOfPublicKey;
