/**
 * @file Library to scan a QR code and copy the content to the clipboard.
 */

const Dialog = require("ui/dialogs");
const BCScanner = require("nativescript-barcodescanner").BarcodeScanner;
const Clipboard = require("nativescript-clipboard");

const BarCodeScanner = new BCScanner();

// Functions ------------------------------------------------------------------

/**
 * Global scan to clip function that is exported as main library function. It permits you to scan a QR code, the
 * content will be copied to the clipboard.
 * @returns {Promise} - a promise that gets resolved once the user took a photo
 */
function scan() {
  return BarCodeScanner.available()
    .then(function (available) {
      if (available) {
        return BarCodeScanner.scan({
          message: "Scan the QR code.",
          showFlipCameraButton: true,
          showTorchButton: true,
          resultDisplayDuration: 1000,
          openSettingsIfPermissionWasPreviouslyDenied: true,
          beepOnScan: true,
          continuousScanCallback: continuousCallback,
          closeCallback: closeCallback
        });
      } else {
        return Dialog.alert({
          title: "Where is your camera?",
          message: "There is no camera available on your phone.",
          okButtonText: "Ok"
        });
      }
    })
    .catch(() => {
      // This error callback gets called even if there is no error. It gets called when no scan
      // has been made.
      /*
       return Dialog.alert({
       title: "Error",
       message: "An unexpected error occurred during the scan to clip process.",
       okButtonText: "Ok"
       });
       */
    });
}

/**
 * Callback function called every time a code has been scanned. In our case we stop after the first success. It will
 * copy the result to the clipboard and stop the scanning process.
 * @param {object} scanResult - the result of the scan
 * @returns {Promise} - a promise that gets resolved once the content of the scan has been set to the clipboard
 */
const continuousCallback = function (scanResult) {
  return Clipboard.setText(scanResult.text)
    .then(() => {
      return BarCodeScanner.stop();
    })
    .then(() => {
      return Dialog.alert({
        title: "Copied to Clipboard",
        message: scanResult.text,
        okButtonText: "Nice!"
      });
    })
    .catch(() => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An unexpected error occurred during the scan process.",
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
};

/**
 * Unused close callback function.
 */
const closeCallback = function () {
  // Unused
};

// Exports --------------------------------------------------------------------
module.exports.scan = scan;
