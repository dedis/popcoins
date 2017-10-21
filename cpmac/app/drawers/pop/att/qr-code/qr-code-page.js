const PlatformModule = require("tns-core-modules/platform");
const ZXing = require("nativescript-zxing");
const ImageSource = require("image-source");

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

exports.onLoaded = onLoaded;
