const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");

const viewModel = ObservableModule.fromObject({
                                                registeredKeys: new ObservableArray()
                                              });

const myRegisteredKeys = viewModel.registeredKeys;
const EOL_REGEX = /[\r\n]+/;

function RegisterViewModel() {
  setUpRegisteredKeys();

  return viewModel;
}

/**
 * Sets up the the registeredKeys list with all the needed functions to manage it.
 */
function setUpRegisteredKeys() {

  /**
   * Loads the list of registered keys.
   * @returns {*|Promise.<any>}
   */
  myRegisteredKeys.load = function () {
    return FileIO.getContentOf(FilesPath.POP_REGISTERED_KEYS)
                 .then(content => {
                   return content.split(EOL_REGEX);
                 })
                 .then(keysArray => {
                   for (let i = 0; i < keysArray.length; ++i) {
                     myRegisteredKeys.push({
                                             key: keysArray[i]
                                           });
                   }

                   return Promise.resolve();
                 });
  };

  /**
   * Adds a new key to the list of registered keys.
   * @param key - the string of the public key
   * @returns {*|Promise.<any>}
   */
  myRegisteredKeys.addKey = function (key) {
    // TODO: check if the key has a valid format
    const arrayOfKeys = myRegisteredKeys.map(keyObject => {
      return keyObject.key;
    });

    if (arrayOfKeys.includes(key)) {
      return Promise.reject();
    } else {
      myRegisteredKeys.push({
                              key: key
                            });

      return saveKeysToFile();
    }
  };

  /**
   * Empties the list completely by deleting them permanently.
   * @returns {*|Promise.<any>}
   */
  myRegisteredKeys.empty = function () {
    while (myRegisteredKeys.length) {
      myRegisteredKeys.pop();
    }

    return FileIO.writeContentTo(FilesPath.POP_REGISTERED_KEYS, "");
  };

  /**
   * Clears the list of registered keys, but only in the memory. The permanently stored keys are not affected by
   * this function.
   */
  myRegisteredKeys.clear = function () {
    while (myRegisteredKeys.length) {
      myRegisteredKeys.pop();
    }
  };

  /**
   * Deletes a specific key at a given index.
   * @param index - the index of the key to delete
   * @returns {*|Promise.<any>}
   */
  myRegisteredKeys.deleteByIndex = function (index) {
    if (0 <= index && index < myRegisteredKeys.length) {
      myRegisteredKeys.splice(index, 1);

      return saveKeysToFile();
    } else {
      return Promise.reject();
    }
  };
}

/**
 * Function to save the public keys of the attendees permanently.
 * @returns {*|Promise.<any>}
 */
function saveKeysToFile() {
  const linesOfKeys = myRegisteredKeys.map(keyObject => {
                                        return keyObject.key;
                                      })
                                      .join("\n");

  return FileIO.writeContentTo(FilesPath.POP_REGISTERED_KEYS, linesOfKeys);
}

module.exports = RegisterViewModel;
