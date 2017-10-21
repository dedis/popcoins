const Dialog = require("ui/dialogs");
const SwipeToDelete = require("~/shared/lib/ios-swipe-delete/ios-swipe-delete");
const BCScanner = require("nativescript-barcodescanner").BarcodeScanner;
const RegisterViewModel = require("./register-view-model");

const BarCodeScanner = new BCScanner();

const registerViewModel = new RegisterViewModel();
const myRegisteredKeys = registerViewModel.registeredKeys;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  // TODO: implement item delete for Android
  if (page.ios) {
    let listView = page.getViewById("list-view-registered-keys");

    SwipeToDelete.enable(listView, function (index) {
      myRegisteredKeys.deleteByIndex(index);
    });
  }

  page.bindingContext = registerViewModel;

  loadRegisteredKeys();
}

/**
 * Loads the registered public keys of the attendees into the list.
 */
function loadRegisteredKeys() {
  myRegisteredKeys.clear();
  myRegisteredKeys.load();
}

/**
 * Function that gets called when the user wants to register a public key manually.
 */
function addManual() {
  Dialog.prompt({
                  title: "Public Key",
                  message: "Please enter the public key of an attendee.",
                  okButtonText: "Register",
                  cancelButtonText: "Cancel",
                  inputType: Dialog.inputType.text
                })
        .then(args => {
          if (args.result && args.text !== undefined && args.text.length > 0) {
            return myRegisteredKeys.addKey(args.text);
          }
        });
}

/**
 * Function that gets called when the user wants to register a public key by scanning it.
 */
function addScan() {
  BarCodeScanner.available().then(function (available) {
    if (available) {
      availableFunction();
    } else {
      notAvailableFunction();
    }
  });

  /**
   * Function that gets executed when there is a camera available on the users phone.
   */
  function availableFunction() {
    /**
     * Called every time a code was scanned.
     * @param scanResult - the result of the scan
     * @returns {*|Promise.<any>}
     */
    const continuousCallback = function (scanResult) {
      // TODO: catch error when not added
      return myRegisteredKeys.addKey(scanResult.text)
                             .then(() => {
                               return BarCodeScanner.stop();
                             });
    };

    /**
     * Called when the scan session terminates.
     */
    const closeCallback = function () {
      // Unused
    };

    BarCodeScanner.scan({
                          message: "Scan the public keys of the attendees.",
                          showFlipCameraButton: true,
                          showTorchButton: true,
                          resultDisplayDuration: 1000,
                          openSettingsIfPermissionWasPreviouslyDenied: true,
                          beepOnScan: true,
                          continuousScanCallback: continuousCallback,
                          closeCallback: closeCallback
                        })
                  .then(function () {
                    // Unused
                  }, function (error) {
                    /*
                     Dialog.alert({
                     title: "Please try again!",
                     message: "An error occurred.",
                     okButtonText: "Ok"
                     });
                     */

                    console.dir(error);
                  });
  }

  /**
   * Function that gets executed when there is no camera available on the users phone.
   */
  function notAvailableFunction() {
    Dialog.alert({
                   title: "Where is your camera?",
                   message: "There is no camera available on your phone.",
                   okButtonText: "Ok"
                 });
  }
}

/**
 * Function that gets called when the user wants to delete the whole list of registered keys.
 */
function empty() {
  myRegisteredKeys.empty();
}

exports.onLoaded = onLoaded;
exports.addManual = addManual;
exports.addScan = addScan;
exports.empty = empty;
