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
  return Dialog.prompt({
                         title: "Public Key",
                         message: "Please enter the public key of an attendee.",
                         okButtonText: "Register",
                         cancelButtonText: "Cancel",
                         inputType: Dialog.inputType.text
                       })
               .then(args => {
                 if (args.result && args.text !== undefined && args.text.length > 0) {
                   return myRegisteredKeys.addKey(args.text);
                 } else {
                   return Promise.reject();
                 }
               })
               .catch(() => {
                 return Dialog.alert({
                                       title: "Error",
                                       message: "This public key has not been added to the list. It may be duplicate" +
                                                " or does not have the right format.",
                                       okButtonText: "Ok"
                                     });
               });
}

/**
 * Function that gets called when the user wants to register a public key by scanning it.
 */
function addScan() {
  return BarCodeScanner.available().then(function (available) {
    if (available) {
      return availableFunction();
    } else {
      return notAvailableFunction();
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
      return myRegisteredKeys.addKey(scanResult.text)
                             .then(() => {
                               return BarCodeScanner.stop();
                             })
                             .catch(() => {
                               return BarCodeScanner.stop()
                                                    .then(() => {
                                                      Dialog.alert({
                                                                     title: "Error",
                                                                     message: "This public key has not been added to the" +
                                                                              "list. It may be duplicate or does not" +
                                                                              " have the right format.",
                                                                     okButtonText: "Ok"
                                                                   });
                                                    });
                             });
    };

    /**
     * Called when the scan session terminates.
     */
    const closeCallback = function () {
      // Unused
    };

    return BarCodeScanner.scan({
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
                           // This error callback gets called even if there is no error. It gets called when no scan
                           // has been made.
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
    return Dialog.alert({
                          title: "Where is your camera?",
                          message: "There is no camera available on your phone.",
                          okButtonText: "Ok"
                        });
  }
}

/**
 * Function called when the button "register" is clicked. It starts the registration process with the organizers conode.
 * @returns {Promise.<any>}
 */
function registerKeys() {
  return myRegisteredKeys.register();
}

/**
 * Function that gets called when the user wants to delete the whole list of registered keys.
 */
function empty() {
  return Dialog.confirm({
                          title: "Please Confirm",
                          message: "Do you really want to delete all the registered public keys?",
                          okButtonText: "Yes",
                          cancelButtonText: "No"
                        })
               .then(function (result) {
                 if (result) {
                   return myRegisteredKeys.empty();
                 } else {
                   return Promise.reject();
                 }
               })
               .catch(() => {
                 return Dialog.alert({
                                       title: "Deletion Aborted",
                                       message: "The deletion process has been aborted, either by you or by an error.",
                                       okButtonText: "Ok"
                                     });
               });
}

exports.onLoaded = onLoaded;
exports.addManual = addManual;
exports.addScan = addScan;
exports.registerKeys = registerKeys;
exports.empty = empty;
