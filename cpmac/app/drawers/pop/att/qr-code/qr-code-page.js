const PlatformModule = require("tns-core-modules/platform");
const ZXing = require("nativescript-zxing");
const ImageSource = require("image-source");
const Clipboard = require("nativescript-clipboard");
const Dialog = require("ui/dialogs");

const QrCodeViewModel = require("./qr-code-view-model");

const QRGenerator = new ZXing();

let labelPublicKey = undefined;
let imagePublicKey = undefined;

let publicKey = undefined;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  publicKey = page.bindingContext.publicKey;

  loadViews(page);

  page.bindingContext = new QrCodeViewModel();

  if (labelPublicKey === undefined || imagePublicKey === undefined || publicKey === undefined) {
    throw new Error("a field is undefined, but is should not");
  }

  loadFields();
}

/**
 * We load all the views needed to display the public key as text and as QR code.
 * @param page -  the current page object
 */
function loadViews(page) {
  labelPublicKey = page.getViewById("label-public-key");
  imagePublicKey = page.getViewById("image-public-key");
}

/**
 * We load the text and the QR code (after generating it) into the views.
 */
function loadFields() {
  // We set the text of the public key to the label.
  labelPublicKey.text = publicKey;

  // We generate the QR code image and set it to the image container in the XML.
  let sideLength = PlatformModule.screen.mainScreen.widthPixels;
  const QR_CODE = QRGenerator.createBarcode({
                                              encode: publicKey,
                                              format: ZXing.QR_CODE,
                                              height: sideLength,
                                              width: sideLength
                                            });

  imagePublicKey.imageSource = ImageSource.fromNativeSource(QR_CODE);
}

/**
 * Function called when the user clicks on the QR code, the public key gets stored in the clipboard.
 * @returns {Promise.<any>}
 */
function copyToClipboard() {
  return Clipboard.setText(publicKey)
                  .then(() => {
                    return Dialog.alert({
                                          title: "Copied to Clipboard",
                                          message: "Your public key has been copied to the clipboard. Paste it where" +
                                                   " you want.",
                                          okButtonText: "Ok"
                                        });
                  })
                  .catch(() => {
                    return Dialog.alert({
                                          title: "Clipboard Error",
                                          message: "We encountered an error trying to copy your public key to the" +
                                                   " clipboard. Please try again.",
                                          okButtonText: "Ok"
                                        });
                  });
}

exports.onLoaded = onLoaded;
exports.copyToClipboard = copyToClipboard;
