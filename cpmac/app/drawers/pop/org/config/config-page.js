const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");

const ConfigViewModel = require("./config-view-model");

const files = [FilesPath.POP_DESC_HASH];
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

  page.bindingContext = new ConfigViewModel();
}

function loadViews(page) {
  while (textFields.length) {
    textFields.pop();
  }

  textFields.push(page.getViewById("text-field-description"));
}

/**
 * Hashes and saves the config/description entered by the organizer of the PoP party.
 * @returns {Promise.<*[]>}
 */
function hashAndSave() {
  const filesToSave = Array.from(files);

  for (let i = 0; i < filesToSave.length; ++i) {
    // TODO: compute hash
    let hash = textFields[i].text;

    filesToSave[i] = FileIO.writeContentTo(filesToSave[i], hash);
  }

  return Promise.all(filesToSave).then(() => {
    for (let i = 0; i < textFields.length; ++i) {
      textFields[i].text = "";
    }

    return Promise.resolve();
  });
}

exports.onLoaded = onLoaded;
exports.hashAndSave = hashAndSave;
