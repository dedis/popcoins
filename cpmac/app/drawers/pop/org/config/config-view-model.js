const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const DeepCopy = require("~/shared/lib/deep-copy/DeepCopy");
const StatusExtractor = require("~/shared/lib/extractors/StatusExtractor");

const viewModel = ObservableModule.fromObject({
                                                partyConodes: new ObservableArray()
                                              });

const myPartyConodes = viewModel.partyConodes;

function ConfigViewModel() {
  setUpPartyConodes();

  return viewModel;
}

/**
 * Sets up the partyConodes list with all the needed functions to manage it.
 */
function setUpPartyConodes() {

  /**
   * Gets the conode at index given as parameter.
   * @param index - the wanted index
   * @returns {Promise.<conode>}
   */
  myPartyConodes.get = function (index) {
    return FileIO.getStringOf(FilesPath.POP_PARTY_CONODES)
                 .then(tomlString => {
                   return DedisJsNet.parseCothorityRoster(tomlString).servers;
                 })
                 .then(servers => {
                   return servers[index];
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
   * Loads the list of conodes for the PoP Party.
   * @returns {*|Promise.<any>}
   */
  myPartyConodes.load = function () {
    return FileIO.getStringOf(FilesPath.POP_PARTY_CONODES)
                 .then(tomlString => {
                   if (tomlString.length === 0) {
                     return [];
                   } else {
                     return DedisJsNet.parseCothorityRoster(tomlString).servers;
                   }
                 })
                 .then(servers => {
                   for (let i = 0; i < servers.length; ++i) {
                     if (servers[i] !== undefined) {
                       myPartyConodes.push({
                                             conode: servers[i]
                                           });
                     }
                   }

                   return Promise.resolve();
                 });
  };

  /**
   * Adds a new conode to the list of party conodes.
   * @param conodeToml - the conode toml string to add
   * @returns {*|Promise.<any>}
   */
  myPartyConodes.addConode = function (conodeToml) {
    const arrayOfPublicKeys = myPartyConodes.map(conode => {
      return conode.Public;
    });

    if (conodeToml === undefined || conodeToml.length === 0) {
      return Promise.reject();
    } else {
      const conode = DedisJsNet.parseCothorityRoster(tomlString).servers[0];

      if (arrayOfPublicKeys.includes(conode.Public)) {
        return Promise.reject();
      }

      myPartyConodes.unshift({
                               conode: DeepCopy.copy(conode)
                             });

      return saveConodesToFile();
    }
  };

  /**
   * Adds the conode of the organizer to the list of party conodes.
   * @returns {Promise.<any>}
   */
  myPartyConodes.addMyOwnConode = function () {
    /* TODO: implement
     return FileIO.getStringOf(FilesPath.PUBLIC_KEY)
     .then(myOwnPublicKey => {
     return myRegisteredKeys.addKey(myOwnPublicKey);
     });
     */
  };

  /**
   * Empties the list completely by deleting them permanently.
   * @returns {*|Promise.<any>}
   */
  myPartyConodes.empty = function () {
    while (myPartyConodes.length) {
      myPartyConodes.pop();
    }

    return FileIO.writeStringTo(FilesPath.POP_PARTY_CONODES, "");
  };

  /**
   * Clears the list of party conodes, but only in the memory. The permanently stored conodes are not affected by
   * this function.
   */
  myPartyConodes.clear = function () {
    while (myPartyConodes.length) {
      myPartyConodes.pop();
    }
  };

  /**
   * Deletes a specific conode at a given index.
   * @param index - the index of the conode to delete
   * @returns {*|Promise.<any>}
   */
  myPartyConodes.deleteByIndex = function (index) {
    if (0 <= index && index < myPartyConodes.length) {
      myPartyConodes.splice(index, 1);

      return saveConodesToFile();
    } else {
      return Promise.reject();
    }
  };
}

/**
 * Function to save the party conodes of the organizers permanently.
 * @returns {*|Promise.<any>}
 */
function saveConodesToFile() {
  const tomlOfConodes = myPartyConodes.map(conodeObject => {
                                        return StatusExtractor.getToml(conodeObject);
                                      })
                                      .join("\n");

  console.log(tomlOfConodes);

  return FileIO.writeStringTo(FilesPath.POP_PARTY_CONODES, tomlOfConodes + "\n");
}

module.exports = ConfigViewModel;
