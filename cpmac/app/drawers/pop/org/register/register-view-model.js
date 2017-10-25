const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Dialog = require("ui/dialogs");
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
                     if (keysArray[i] !== "") {
                       myRegisteredKeys.push({
                                               key: keysArray[i]
                                             });
                     }
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
    const arrayOfKeys = myRegisteredKeys.map(keyObject => {
      return keyObject.key;
    });

    if (arrayOfKeys.includes(key) || key.length === 0) {
      return Promise.reject();
    } else {
      // TODO: check if the key has a valid format
      myRegisteredKeys.unshift({
                                 key: key
                               });

      return saveKeysToFile();
    }
  };

  /**
   * Adds the key of the organizer to the list of registered keys.
   * @returns {Promise.<any>}
   */
  myRegisteredKeys.addMyself = function () {
    return FileIO.getContentOf(FilesPath.POP_PUBLIC_KEY)
                 .then(myOwnPublicKey => {
                   return myRegisteredKeys.addKey(myOwnPublicKey);
                 });
  };

  /**
   * Function called when the organizer wants to register the public keys of the attendees on his conode.
   * @returns {Promise.<any>}
   */
  myRegisteredKeys.register = function () {
    return FileIO.getContentOf(FilesPath.POP_DESC_HASH)
                 .then(descriptionHash => {
                   const arrayOfKeys = myRegisteredKeys.map(keyObject => {
                     return keyObject.key;
                   });

                   if (descriptionHash.length > 0 && arrayOfKeys.length > 0) {
                     return Dialog.confirm({
                                             title: "Register Public Keys",
                                             message: "You are about to register the keys of the attendees on your" +
                                                      " conode. Please confirm what follows.\n\nDescription Hash:\n" +
                                                      descriptionHash + "\nPublic Keys to Register:\n" +
                                                      arrayOfKeys.join("\n\n"),
                                             okButtonText: "Register",
                                             cancelButtonText: "Cancel"
                                           })
                                  .then(result => {
                                    if (result) {
                                      return sendKeysToConode(descriptionHash);
                                    } else {
                                      return Promise.resolve();
                                    }
                                  })
                                  .catch(() => {
                                    return Dialog.alert({
                                                          title: "Registration Error",
                                                          message: "An unexpected error occurred during the" +
                                                                   " registration process. Please try again.",
                                                          okButtonText: "Ok"
                                                        });
                                  });
                   } else {
                     return Dialog.alert({
                                           title: "Missing Information",
                                           message: "Please provide more information, we need the hash of your" +
                                                    " description and the keys of the registered attendees.",
                                           okButtonText: "Ok"
                                         });
                   }
                 })
                 .catch(() => {
                   return Dialog.alert({
                                         title: "Registration Error",
                                         message: "An unexpected error occurred during the" +
                                                  " registration process. Please try again.",
                                         okButtonText: "Ok"
                                       });
                 });
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

/**
 * Function that sends the public keys of the registered attendees to the conode of the organizer.
 * @param descriptionHash -  the hash of the PoP Party description
 * @returns {Promise.<any>}
 */
function sendKeysToConode(descriptionHash) {
  // TODO: actually register keys on conode
  return Promise.resolve();
}

module.exports = RegisterViewModel;
