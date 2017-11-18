const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");

const PopViewModel = require("./pop-view-model");

const files = [FilesPath.POP_DESC_HASH, FilesPath.PUBLIC_KEY, FilesPath.PRIVATE_KEY, FilesPath.POP_FINAL_TOML];
const textFields = [];

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  loadViews(page);
  if (files.length !== textFields.length) {
    throw new Error("files array and textFields array do not have the same length");
  }

  page.bindingContext = new PopViewModel();

  loadFields();
}

/**
 * Loads the needed views of the text fields.
 * @param page - the current page object
 */
function loadViews(page) {
  while (textFields.length) {
    textFields.pop();
  }

  textFields.push(page.getViewById("text-field-description"));
  textFields.push(page.getViewById("text-field-public-key"));
  textFields.push(page.getViewById("text-field-private-key"));
  textFields.push(page.getViewById("text-view-final-toml"));
}

/**
 * Function to load the files and information stored. Returns a promise that is completed when everything has been
 * loaded.
 * @returns {Promise.<*[]>}
 */
function loadFields() {
  const filesToLoad = Array.from(files);

  for (let i = 0; i < filesToLoad.length; ++i) {
    filesToLoad[i] = FileIO.getStringOf(filesToLoad[i])
                           .then(content => {
                             textFields[i].text = content;

                             return Promise.resolve();
                           });
  }

  return Promise.all(filesToLoad);
}

/**
 * Function to save the users input into the corresponding files. Returns a promise that is completed when
 * everything has been saved.
 * @returns {Promise.<*[]>}
 */
function saveFields() {
  const filesToSave = Array.from(files);

  for (let i = 0; i < filesToSave.length; ++i) {
    filesToSave[i] = FileIO.writeStringTo(filesToSave[i], textFields[i].text);
  }

  return Promise.all(filesToSave);
}

/**
 * Function to clear the files and information stored. Returns a promise that is completed when everything has
 * been cleared.
 * @returns {Promise.<*[]>}
 */
function emptyFields() {

  /**
   * Clears the stored information in the settings.
   * @returns {Promise.<any>}
   */
  function clearSettings() {
    const filesToEmpty = Array.from(files);

    filesToEmpty.map(filePath => {
      return FileIO.writeStringTo(filePath, "");
    });

    return Promise.all(filesToEmpty).then(() => {
      return loadFields();
    });
  }

  function clearOrgConfigRegisteredPublicKeys() {
    return FileIO.writeStringTo(FilesPath.POP_PARTY_DATETIME, "")
                 .then(() => {
                   return FileIO.writeStringTo(FilesPath.POP_PARTY_LOCATION, "");
                 })
                 .then(() => {
                   return FileIO.writeStringTo(FilesPath.POP_PARTY_NAME, "");
                 })
                 .then(() => {
                   return FileIO.writeStringTo(FilesPath.POP_PARTY_CONODES, "");
                 })
                 .then(() => {
                   return FileIO.writeStringTo(FilesPath.POP_REGISTERED_KEYS, "");
                 });
  }

  return Dialog.confirm({
                          title: "Delete Stored Settings",
                          message: "You are about to delete your stored information, are you sure?",
                          okButtonText: "Delete ^ & 'ORG Config + Registered Keys'",
                          cancelButtonText: "Cancel",
                          neutralButtonText: "Delete 'Description Hash', 'Key Pair' & 'final.toml'"
                        })
               .then(result => {
                 if (result) {
                   return clearSettings()
                     .then(() => {
                       return clearOrgConfigRegisteredPublicKeys();
                     });
                 } else if (result === undefined) {
                   return clearSettings();
                 } else {
                   return Promise.resolve();
                 }
               })
               .catch(() => {
                 return Dialog.alert({
                                       title: "Deletion Error",
                                       message: "An unexpected error occurred during the deletion process. Please" +
                                                " try again.",
                                       okButtonText: "Ok"
                                     });
               });
}

exports.onLoaded = onLoaded;
exports.saveFields = saveFields;
exports.emptyFields = emptyFields;
