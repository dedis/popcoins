/**
 * @file Library to scan a QR code and return the content as a string.
 */

const Log = require("./Log").default;
const BCScanner = require("nativescript-barcodescanner").BarcodeScanner;

const BarCodeScanner = new BCScanner();
const SCAN_ABORTED = "Scan aborted";

// Functions ------------------------------------------------------------------

/**
 * Global scan to return function that is exported as main library function. It permits you to scan a QR code, the
 * content will be returned as a string.
 * @returns {Promise} - a promise that gets resolved once the user took a photo
 */
function scan() {
    return BarCodeScanner.available()
        .then(available => {
            if (!available) {
                console.log("scanner not available!");
                return Promise.reject();
            }

            return BarCodeScanner.scan({
                message: "Scan the QR code.",
                showFlipCameraButton: true,
                showTorchButton: true,
                resultDisplayDuration: 1000,
                openSettingsIfPermissionWasPreviouslyDenied: true,
                beepOnScan: true,
            });
        })
        .then(scanResult => {
            return scanResult.text;
        })
        .catch(error => {
            Log.rcatch("some error occured:", error);
        });
}

// Exports --------------------------------------------------------------------
module.exports.scan = scan;
module.exports.SCAN_ABORTED = SCAN_ABORTED;
