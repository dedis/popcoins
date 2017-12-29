const PlatformModule = require("tns-core-modules/platform");
const ZXing = require("nativescript-zxing");
const ImageSource = require("image-source");
const Clipboard = require("nativescript-clipboard");
const Dialog = require("ui/dialogs");

const QRGenerator = new ZXing();

let textView = undefined;
let qrImage = undefined;

let textToShow = undefined;

let closeCallBackFunction = undefined;

function onShownModally(args) {
  closeCallBackFunction = args.closeCallback;
  textToShow = args.context.textToShow;

  if (textToShow === undefined) {
    throw new Error("textToShow is undefined, but is should not");
  }

  loadFields();
}

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  loadViews(page);

  if (textView === undefined || qrImage === undefined) {
    throw new Error("a field is undefined, but is should not");
  }

  loadFields();
}

/**
 * We load all the views needed to display the text and QR code.
 * @param page -  the current page object
 */
function loadViews(page) {
  textView = page.getViewById("text-view");
  qrImage = page.getViewById("image");
}

/**
 * We load the text and the QR code (after generating it) into the views.
 */
function loadFields() {
  if (textView === undefined || qrImage === undefined || textToShow === undefined) {
    return;
  }

  // We set the text the text view.
  textView.text = textToShow;

  // We generate the QR code image and set it to the image container in the XML.
  let sideLength = PlatformModule.screen.mainScreen.widthPixels / 6;
  const QR_CODE = QRGenerator.createBarcode({
    encode: textToShow,
    format: ZXing.QR_CODE,
    height: sideLength,
    width: sideLength
  });

  qrImage.imageSource = ImageSource.fromNativeSource(QR_CODE);
}

/**
 * Function called when the user clicks on the QR code, the public key gets stored in the clipboard.
 * @returns {Promise.<any>}
 */
function copyToClipboard() {
  return Clipboard.setText(textToShow)
    .then(() => {
      return Dialog.alert({
        title: "Copied to Clipboard",
        message: "The text has been copied to the clipboard.",
        okButtonText: "Ok"
      });
    })
    .catch(() => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Clipboard Error",
        message: "We encountered an error trying to copy the text to the clipboard. Please try again.",
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

/**
 * Function called when the user wants to leave the QR code page.
 */
function onDone() {
  closeCallBackFunction(undefined);
}

module.exports.onShownModally = onShownModally;
module.exports.onLoaded = onLoaded;
module.exports.copyToClipboard = copyToClipboard;
module.exports.onDone = onDone;
