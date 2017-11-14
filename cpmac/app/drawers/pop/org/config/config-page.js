const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const SwipeToDelete = require("~/shared/lib/ios-swipe-delete/ios-swipe-delete");
const BCScanner = require("nativescript-barcodescanner").BarcodeScanner;
const ModalPicker = require("nativescript-modal-datetimepicker").ModalDatetimepicker;

const BarCodeScanner = new BCScanner();

const ConfigViewModel = require("./config-view-model");

const DateTimePicker = new ModalPicker();

let textFieldName = undefined;
let labelDate = undefined;
let labelTime = undefined;
let textFieldLocation = undefined;

let chosenDateTime = undefined;

let pageObject = undefined;

const configViewModel = new ConfigViewModel();
const myPartyConodes = configViewModel.partyConodes;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  pageObject = page.page;

  loadViews(page);
  if (textFieldName === undefined || labelDate === undefined || labelTime === undefined ||
      textFieldLocation === undefined) {
    throw new Error("a field is undefined, but it shouldn't");
  }

  page.bindingContext = configViewModel;

  setUp();
}

/**
 * Loads the needed views into their variables.
 * @param page - the current page object
 */
function loadViews(page) {
  textFieldName = page.getViewById("text-field-name");
  labelDate = page.getViewById("label-date");
  labelTime = page.getViewById("label-time");
  textFieldLocation = page.getViewById("text-field-location");

  if (page.ios) {
    let listView = page.getViewById("list-view-conodes");

    SwipeToDelete.enable(listView, function (index) {
      return myPartyConodes.deleteByIndex(index);
    });
  }

  textFieldName.on("textChange", onNameChangeHandler);
  textFieldLocation.on("textChange", onLocationChangeHandler);
}

function onNameChangeHandler() {
  return FileIO.writeStringTo(FilesPath.POP_PARTY_NAME, textFieldName.text);
}

function onLocationChangeHandler() {
  return FileIO.writeStringTo(FilesPath.POP_PARTY_LOCATION, textFieldLocation.text);
}

function setUp() {
  setUpNameLocation();
  setUpDate();
  loadPartyConodes();
}

function setUpNameLocation() {
  return FileIO.getStringOf(FilesPath.POP_PARTY_NAME)
               .then(partyName => {
                 textFieldName.text = partyName;

                 return FileIO.getStringOf(FilesPath.POP_PARTY_LOCATION);
               })
               .then(partyLocation => {
                 textFieldLocation.text = partyLocation;

                 return Promise.resolve();
               })
               .catch(error => {
                 console.log(error);
                 return Dialog.alert({
                                       title: "Error",
                                       message: "An unexpected error occurred during the load process of your party" +
                                                " configuration.",
                                       okButtonText: "Ok"
                                     });
               });
}

function setUpDate() {
  return FileIO.getStringOf(FilesPath.POP_PARTY_DATETIME)
               .then(dateTimeString => {
                 if (dateTimeString === "") {
                   chosenDateTime = new Date(Date.now());
                   chosenDateTime.setMilliseconds(0);
                   chosenDateTime.setSeconds(0);
                 } else {
                   chosenDateTime = new Date(Date.parse(dateTimeString));
                 }

                 labelDate.text = chosenDateTime.toDateString();
                 labelTime.text = chosenDateTime.toTimeString();
               });
}

function loadPartyConodes() {
  myPartyConodes.clear();
  myPartyConodes.load();
}

function setDate() {
  return DateTimePicker.pickDate({
                                   title: "Pick a Date for you PoP Party"
                                 })
                       .then((date) => {
                         const newDate = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);

                         if (newDate.toDateString() !== "Invalid Date") {
                           chosenDateTime.setYear(date.year);
                           chosenDateTime.setMonth(date.month - 1);
                           chosenDateTime.setDate(date.day);

                           labelDate.text = chosenDateTime.toDateString();

                           return FileIO.writeStringTo(FilesPath.POP_PARTY_DATETIME, chosenDateTime.toUTCString());
                         }

                         return Promise.resolve();
                       })
                       .catch(error => {
                         console.log(error);
                         return Dialog.alert({
                                               title: "Error",
                                               message: "An unexpected error occurred during the save process of" +
                                                        " your chosen date.",
                                               okButtonText: "Ok"
                                             });
                       });
}

function setTime() {
  return DateTimePicker.pickTime({
                                   title: "Pick a Time for you PoP Party"
                                 })
                       .then((time) => {
                         const newTime = new Date(0, 0, 0, time.hour, time.minute, 0, 0);

                         if (newTime.toDateString() !== "Invalid Date") {
                           chosenDateTime.setHours(time.hour);
                           chosenDateTime.setMinutes(time.minute);

                           labelTime.text = chosenDateTime.toTimeString();

                           return FileIO.writeStringTo(FilesPath.POP_PARTY_DATETIME, chosenDateTime.toUTCString());
                         }

                         return Promise.resolve();
                       })
                       .catch(error => {
                         console.log(error);
                         return Dialog.alert({
                                               title: "Error",
                                               message: "An unexpected error occurred during the save process of" +
                                                        " your chosen time.",
                                               okButtonText: "Ok"
                                             });
                       });
}

/**
 * Changes the frame to be able to add a conode manually.
 */
function addManual() {
  function addManualCallBack(conode) {
    if (conode !== undefined) {
      myPartyConodes.addConode(conode);
    }
  }

  pageObject.showModal("drawers/pop/org/config/add-manual/add-manual-page", undefined, addManualCallBack, true);
}

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
      return myPartyConodes.addConodeByTomlString(scanResult.text)
                           .then(() => {
                             return BarCodeScanner.stop();
                           })
                           .catch(() => {
                             return BarCodeScanner.stop()
                                                  .then(() => {
                                                    return Dialog.alert({
                                                                          title: "Error",
                                                                          message: "This conode has not been added to the" +
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
                                 message: "Scan the conode of the organizer.",
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
 * Hashes and saves the config/description entered by the organizer of the PoP party.
 * @returns {Promise.<*[]>}
 */
function hashAndSave() {
  const name = textFieldName.text;
  const date = labelDate.text;
  const time = labelTime.text;
  const location = textFieldLocation.text;

  /**
   * Hashes the description and stores it permanently.
   * @returns {*|Promise.<any>}
   */
  function hashAndStore() {
    // TODO: actually compute hash
    // let descriptionHash = name + date + time + location + "(hashed)";
    let descriptionHash = chosenDateTime.toUTCString();
    console.log(descriptionHash);

    return FileIO.writeStringTo(FilesPath.POP_DESC_HASH, descriptionHash)
                 .then(() => {
                   return Dialog.alert({
                                         title: "Successfully Hashed",
                                         message: "The hash of you description is accessible in your" +
                                                  " settings.\n\nHash:\n" + descriptionHash,
                                         okButtonText: "Ok"
                                       });
                 });
  }

  if (name.length > 0 && date.length > 0 && time.length > 0 && location.length > 0) {
    return FileIO.getStringOf(FilesPath.POP_DESC_HASH)
                 .then(storedHash => {
                   if (storedHash.length > 0) {
                     return Dialog.confirm({
                                             title: "Old Description Hash Overwriting",
                                             message: "You already have a description hash stored in your settings." +
                                                      " Do you really want to overwrite it?",
                                             okButtonText: "Yes",
                                             cancelButtonText: "Cancel"
                                           })
                                  .then(result => {
                                    if (result) {
                                      return hashAndStore();
                                    } else {
                                      return Promise.resolve();
                                    }
                                  })
                                  .catch(() => {
                                    return Dialog.alert({
                                                          title: "Error During Hashing Process",
                                                          message: "An unexpected error occurred during the hashing" +
                                                                   " process. Please try again.",
                                                          okButtonText: "Ok"
                                                        });
                                  });
                   } else {
                     return hashAndStore();
                   }
                 })
                 .catch(() => {
                   return Dialog.alert({
                                         title: "Error During Hashing Process",
                                         message: "An unexpected error occurred during the hashing" +
                                                  " process. Please try again.",
                                         okButtonText: "Ok"
                                       });
                 });
  } else {
    return Dialog.alert({
                          title: "Missing Information",
                          message: "Please provide a name, date, time, location and a list of public keys of the" +
                                   " organizers conodes for your PoP Party.",
                          okButtonText: "Ok"
                        });
  }
}

function deleteByIndex(args) {
  let indexToDelete = args.index;

  return myPartyConodes.get(indexToDelete)
                       .then(conodeToDelete => {
                         const address = conodeToDelete.Address;
                         const publicKey = conodeToDelete.Public;
                         const description = conodeToDelete.Description;

                         return Dialog.confirm({
                                                 title: "Please Confirm",
                                                 message: "Do you really want to delete the following" +
                                                          " conode?\n\nAddress: " + address + "\nPublic Key: " +
                                                          publicKey + "\nDescription: " + description,
                                                 okButtonText: "Yes",
                                                 cancelButtonText: "No"
                                               })
                                      .then(function (result) {
                                        if (result) {
                                          return myPartyConodes.deleteByIndex(indexToDelete);
                                        } else {
                                          return Promise.resolve();
                                        }
                                      })
                                      .catch(() => {
                                        return Dialog.alert({
                                                              title: "Deletion Aborted",
                                                              message: "The deletion process has been aborted," +
                                                                       "either by you or by an error.",
                                                              okButtonText: "Ok"
                                                            });
                                      });
                       });
}

function emptyList() {
  return Dialog.confirm({
                          title: "Please Confirm",
                          message: "Do you really want to delete all the conodes?",
                          okButtonText: "Yes",
                          cancelButtonText: "No"
                        })
               .then(function (result) {
                 if (result) {
                   return myPartyConodes.empty();
                 } else {
                   return Promise.resolve();
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
exports.setDate = setDate;
exports.setTime = setTime;
exports.hashAndSave = hashAndSave;
exports.addManual = addManual;
exports.addScan = addScan;
exports.deleteByIndex = deleteByIndex;
exports.emptyList = emptyList;
