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
 * @returns {Promise.<any>}
 */
function scanToClip() {
  return BarCodeScanner.available()
                       .then(function (available) {
                         if (available) {
                           return BarCodeScanner.scan({
                                                        message: "Scan your text.",
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
                         return Dialog.alert({
                                               title: "Error",
                                               message: "An unexpected error occurred during the scan to clip process.",
                                               okButtonText: "Ok"
                                             });
                       });
}

/**
 * Callback function called every time a code has been scanned. In our case we stop after the first success. It will
 * copy the result to the clipboard and stop the scanning process.
 * @param scanResult
 * @returns {Promise.<any>}
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
                    return Dialog.alert({
                                          title: "Error",
                                          message: "An unexpected error occurred during the scan to clip process.",
                                          okButtonText: "Too Bad!"
                                        });
                  });
};

/**
 * Unused close callback function.
 */
const closeCallback = function () {
  // Unused
};

// Exports --------------------------------------------------------------------
exports.scanToClip = scanToClip;
