require("nativescript-nodeify");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const Base64 = require("base64-coder-node")();
const Misc = require("~/shared/lib/dedis-js/src/misc");
const Crypto = require("~/shared/lib/dedis-js/src/crypto");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const HASH = require("hash.js");

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
   * Gets the key at index given as parameter.
   * @param index - the wanted index
   * @returns {Promise.<string>}
   */
  myRegisteredKeys.get = function (index) {
    return FileIO.getStringOf(FilesPath.POP_REGISTERED_KEYS)
      .then(content => {
        return content.split(EOL_REGEX);
      })
      .then(keysArray => {
        return keysArray[index];
      })
      .catch(() => {
        return Dialog.alert({
          title: "Error",
          message: "An unexpected error occurred. Please try again.",
          okButtonText: "Ok"
        });
      });
  };

  /**
   * Loads the list of registered keys.
   * @returns {*|Promise.<any>}
   */
  myRegisteredKeys.load = function () {
    return FileIO.getStringOf(FilesPath.POP_REGISTERED_KEYS)
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
   * @param key - the hex string of the public key
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
    return FileIO.getStringOf(FilesPath.PUBLIC_KEY_COTHORITY)
      .then(myOwnPublicKey => {
        return myRegisteredKeys.addKey(myOwnPublicKey);
      });
  };

  /**
   * Function called when the organizer wants to register the public keys of the attendees on his conode.
   * @returns {Promise.<any>}
   */
  myRegisteredKeys.register = function () {
    return FileIO.getStringOf(FilesPath.POP_DESC_HASH)
      .then(descriptionHash => {
        const arrayOfKeys = myRegisteredKeys.map(keyObject => {
          return keyObject.key;
        });

        if (descriptionHash.length > 0 && arrayOfKeys.length > 0) {
          return Dialog.confirm({
            title: "Register Public Keys",
            message: "You are about to register the keys of the attendees on your" +
              " conode. Please confirm what follows.\n\nDescription Hash:\n" +
              descriptionHash + "\n\n\nPublic Keys to Register:\n" +
              arrayOfKeys.join("\n\n"),
            okButtonText: "Register",
            cancelButtonText: "Cancel"
          })
            .then(result => {
              if (result) {
                return sendKeysToConode(descriptionHash, arrayOfKeys);
              } else {
                return Promise.resolve();
              }
            });
        } else {
          return Dialog.alert({
            title: "Missing Information",
            message: "Please provide more information, we need the keys of the registered attendees.",
            okButtonText: "Ok"
          });
        }
      })
      .catch((error) => {
        console.log(error);
        console.dir(error);
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

    return FileIO.writeStringTo(FilesPath.POP_REGISTERED_KEYS, "");
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
  }).join("\n");

  return FileIO.writeStringTo(FilesPath.POP_REGISTERED_KEYS, linesOfKeys);
}

/**
 * Function that sends the public keys of the registered attendees to the conode of the organizer.
 * @param descriptionHash - the hash of the PoP Party description (in base64-string format)
 * @param arrayOfKeys - an array containing the public keys to register (in hex-string format)
 * @returns {Promise.<any>}
 */
function sendKeysToConode(descriptionHash, arrayOfKeys) {
  const descId = Misc.hexToUint8Array(Base64.decode(descriptionHash, "hex"));

  let totalLength = 0;
  const attendeesArray = arrayOfKeys.map(key => {
    const uInt8ArrayOfKey = Misc.hexToUint8Array(key);
    totalLength += uInt8ArrayOfKey.length;

    return uInt8ArrayOfKey;
  });

  const attendeesConcat = new Uint8Array(totalLength);

  let offset = 0;
  for (let uInt8Array of attendeesArray) {
    attendeesConcat.set(uInt8Array, offset);
    offset += uInt8Array.length;
  }

  let toBeSigned = new Uint8Array(descId.length + attendeesConcat.length);
  toBeSigned.set(descId);
  toBeSigned.set(attendeesConcat, descId.length);

  toBeSigned = HASH.sha256()
    .update(toBeSigned)
    .digest("hex");
  console.log(toBeSigned);

  let signature = undefined;

  return FileIO.getStringOf(FilesPath.PRIVATE_KEY)
    .then(privateKey => {
      const keyPair = Crypto.getKeyPairFromPrivate(privateKey);
      signature = Crypto.schnorrSign(Crypto.toRed(keyPair.getPrivate()), Misc.hexToUint8Array(toBeSigned));

      return FileIO.getStringOf(FilesPath.POP_LINKED_CONODE);
    })
    .then(toml => {
      return DedisJsNet.parseCothorityRoster(toml).servers[0];
    })
    .then(conode => {
      const cothoritySocket = new DedisJsNet.CothoritySocket();
      const finalizeRequestMessage = CothorityMessages.createFinalizeRequest(descId, attendeesArray, signature);

      return cothoritySocket.send(conode, CothorityPath.POP_FINALIZE_REQUEST, finalizeRequestMessage, CothorityDecodeTypes.FINALIZE_RESPONSE);
    })
    .then(finalStatement => {
      const jsonFinalStatement = JSON.stringify(finalStatement, undefined, 4);

      return FileIO.writeStringTo(FilesPath.POP_FINAL_TOML, jsonFinalStatement);
    })
    .then(() => {
      return Dialog.alert({
        title: "Final Statement Saved",
        message: "The final statement can be found in your settings.",
        okButtonText: "Ok"
      });
    })
    .catch(reason => {
      return Dialog.alert({
        title: "Conodes Not Ready Yet",
        message: reason + " - If not all organizers hashed their config retry once they did. - If you were not the last one to register the public keys, you can fetch the finalstement once all the organizers registered the keys.",
        okButtonText: "Ok"
      });
    });
}

module.exports = RegisterViewModel;
