const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");

const ConfigViewModel = require("./config-view-model");

let textFieldDescription = undefined;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  loadViews(page);
  if (textFieldDescription === undefined) {
    throw new Error("a field is undefined, but it shouldn't");
  }

  page.bindingContext = new ConfigViewModel();
}

/**
 * Loads the needed views into their variables.
 * @param page - the current page object
 */
function loadViews(page) {
  textFieldDescription = page.getViewById("text-field-description");
}

/**
 * Hashes and saves the config/description entered by the organizer of the PoP party.
 * @returns {Promise.<*[]>}
 */
function hashAndSave() {
  let description = textFieldDescription.text;

  /**
   * Hashes the description and stores it permanently.
   * @returns {*|Promise.<any>}
   */
  function hashAndStore() {
    // TODO: actually compute hash
    let descriptionHash = description + "(hashed)";

    return FileIO.writeContentTo(FilesPath.POP_DESC_HASH, descriptionHash)
                 .then(() => {
                   return Dialog.alert({
                                         title: "Successfully Hashed",
                                         message: "The hash of you description is accessible in your" +
                                                  " settings.\n\nHash:\n" + descriptionHash,
                                         okButtonText: "Ok"
                                       });
                 });
  }

  if (description.length > 0) {
    return FileIO.getContentOf(FilesPath.POP_DESC_HASH)
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
                          title: "Missing Description",
                          message: "Please provide the description of you PoP Party.",
                          okButtonText: "Ok"
                        });
  }
}

exports.onLoaded = onLoaded;
exports.hashAndSave = hashAndSave;
