const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const ModalPicker = require("nativescript-modal-datetimepicker").ModalDatetimepicker;
const Frame = require("ui/frame");

const ConfigViewModel = require("./config-view-model");

const DateTimePicker = new ModalPicker();

let textFieldName = undefined;
let labelDate = undefined;
let labelTime = undefined;
let textFieldLocation = undefined;

let chosenDateTime = undefined;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  loadViews(page);
  if (textFieldName === undefined || labelDate === undefined || labelTime === undefined ||
      textFieldLocation === undefined) {
    throw new Error("a field is undefined, but it shouldn't");
  }

  page.bindingContext = new ConfigViewModel();

  setUpDate();
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
}

function setUpDate() {
  chosenDateTime = new Date(Date.now());
  chosenDateTime.setMilliseconds(0);
  chosenDateTime.setSeconds(0);

  labelDate.text = chosenDateTime.toDateString();
  labelTime.text = chosenDateTime.toTimeString();
}

function setDate() {
  return DateTimePicker.pickDate({
                                   title: "Pick a Date for you PoP Party"
                                 })
                       .then((date) => {
                         console.log(date.year);
                         console.log(date.month - 1);
                         console.log(date.day);
                         const newDate = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);

                         if (newDate.toDateString() !== "Invalid Date") {
                           chosenDateTime.setYear(date.year);
                           chosenDateTime.setMonth(date.month - 1);
                           chosenDateTime.setDate(date.day);

                           labelDate.text = chosenDateTime.toDateString();
                         }
                       });
}

function setTime() {
  return DateTimePicker.pickTime({
                                   title: "Pick a Time for you PoP Party"
                                 })
                       .then((time) => {
                         console.log(time.hour);
                         console.log(time.minute);
                         const newTime = new Date(0, 0, 0, time.hour, time.minute, 0, 0);

                         if (newTime.toDateString() !== "Invalid Date") {
                           chosenDateTime.setHours(time.hour);
                           chosenDateTime.setMinutes(time.minute);

                           labelTime.text = chosenDateTime.toTimeString();
                         }
                       });
}

/**
 * Changes the frame to be able to add a conode manually.
 */
function addManual() {
  Frame.topmost().navigate({
                             moduleName: "drawers/pop/org/config/add-manual/add-manual-page"
                           });
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

exports.onLoaded = onLoaded;
exports.setDate = setDate;
exports.setTime = setTime;
exports.hashAndSave = hashAndSave;
exports.addManual = addManual;
